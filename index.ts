import * as gcp from "@pulumi/gcp";
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

// Config values
const config = new pulumi.Config();
const postgresUser = config.require("postgresUser");
const postgresPassword = config.requireSecret("postgresPassword");
const jwtSecret = config.requireSecret("jwtSecret");
const testPassword = config.requireSecret("testPassword");
// const supergraphConfig = config.require("supergraph");
const rebuildImages = config.requireBoolean("rebuildImages")


const gcpConfig = new pulumi.Config("gcp");
const projectId = gcpConfig.require("project");
const region = gcpConfig.require("region");
const zone = gcpConfig.require("zone")

// Enable required GCP services
const enabledServices = ["container.googleapis.com", "containerregistry.googleapis.com",]
    .map(service => new gcp.projects.Service(`enable-${service}`, { service }));

// Create GKE cluster
const cluster = new gcp.container.Cluster("microservices-cluster", {
    initialNodeCount: 1,
    location: zone,
    removeDefaultNodePool: true,
    networkingMode: "VPC_NATIVE", // Recommended
    ipAllocationPolicy: {}, // Auto CIDR allocation
    privateClusterConfig: {
        enablePrivateNodes: true, // Set true for production
        enablePrivateEndpoint: false,
        masterIpv4CidrBlock: "172.16.0.0/28"
    },
    masterAuthorizedNetworksConfig: {
        cidrBlocks: [{
            displayName: "all",
            cidrBlock: "0.0.0.0/0" // Restrict in production
        }]
    },
    nodeConfig: {
        diskSizeGb: 20,
    },
    deletionProtection: false,
}, { dependsOn: enabledServices });

const nodePool = new gcp.container.NodePool("primary-node-pool", {
    cluster: cluster.name,
    location: zone,
    nodeConfig: {
        machineType: "e2-medium",
        oauthScopes: [
            "https://www.googleapis.com/auth/cloud-platform",
        ],
        diskSizeGb: 10,
    },
    nodeCount: 1,
}, {dependsOn: cluster});

// Get GCR repository URL
const gcrUrl = pulumi.interpolate`gcr.io/${gcp.config.project}`;

const getImageRef = (name: string, context: string, dockerfile: string) => {
    if (rebuildImages) {
        return new docker.Image(`${name}-image`, {
            imageName: pulumi.interpolate`${gcrUrl}/${name}:latest`,
            build: { context, dockerfile, platform: "linux/amd64" },
        }).imageName;
    }
    return pulumi.interpolate`${gcrUrl}/${name}:latest`;
};

// Build and push images
const authImageRef = getImageRef("auth", ".", "Dockerfile.auth");
const productsImageRef = getImageRef("products", ".", "Dockerfile.products");
const gatewayImageRef = getImageRef("gateway", "./backend/gateway", "./backend/gateway/Dockerfile.local");

export const kubeconfig = pulumi.all([cluster.name, cluster.endpoint, cluster.masterAuth]).apply(([name, endpoint, auth]) => {
    const context = `${gcp.config.project}_${gcp.config.zone}_${name}`;
    return `apiVersion: v1
clusters:
- cluster:
certificate-authority-data: ${auth.clusterCaCertificate}
server: https://${endpoint}
name: ${context}
contexts:
- context:
cluster: ${context}
user: ${context}
name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
user:
auth-provider:
  config:
    cmd-args: config config-helper --format=json
    cmd-path: gcloud
    expiry-key: '{.credential.token_expiry}'
    token-key: '{.credential.access_token}'
  name: gcp
`;
})

// Kubernetes provider
const k8sProvider = new k8s.Provider("gke-k8s", { kubeconfig });
// const k8sProvider = undefined // this will default to correct provider? -@codyduong

// Application namespace
const appNamespace = new k8s.core.v1.Namespace("app-ns", {}, { provider: k8sProvider });

// Secrets
const appSecrets = new k8s.core.v1.Secret("app-secrets", {
    metadata: { namespace: appNamespace.metadata.name },
    stringData: {
        "POSTGRES_PASSWORD": postgresPassword,
        "JWT_SECRET": jwtSecret,
        "TEST_PASSWORD": testPassword,
    },
}, { provider: k8sProvider });

// Database Service (headless for StatefulSet)
const dbService = new k8s.core.v1.Service("db", {
    metadata: { 
        namespace: appNamespace.metadata.name,
        labels: { app: "db" },
    },
    spec: {
        clusterIP: "None", // Headless service
        selector: { app: "db" },
        ports: [{ port: 5432, targetPort: 5432 }],
    },
}, { provider: k8sProvider });

// Database StatefulSet
const dbStatefulSet = new k8s.apps.v1.StatefulSet("db", {
    metadata: { 
        namespace: appNamespace.metadata.name,
        labels: { app: "db" },
    },
    spec: {
        serviceName: "db", // Matches the headless service
        replicas: 1,
        selector: { matchLabels: { app: "db" } },
        template: {
            metadata: { labels: { app: "db" } },
            spec: {
                containers: [{
                    name: "db",
                    image: "timescale/timescaledb:latest-pg17",
                    ports: [{ containerPort: 5432 }],
                    env: [
                        { name: "POSTGRES_USER", value: postgresUser },
                        { 
                            name: "POSTGRES_PASSWORD", 
                            valueFrom: { 
                                secretKeyRef: { 
                                    name: appSecrets.metadata.name, 
                                    key: "POSTGRES_PASSWORD" 
                                } 
                            } 
                        },
                    ],
                    volumeMounts: [{
                        name: "db-data",
                        mountPath: "/var/lib/postgresql/data",
                    },
                    {
                        name: "./init-db.sql",
                        mountPath: "/docker-entrypoint-initdb.d/init-db.sql"
                    }],
                    readinessProbe: {
                        exec: {
                            command: ["pg_isready", "-U", postgresUser],
                        },
                        initialDelaySeconds: 10,
                        periodSeconds: 5,
                    },
                }],
            },
        },
        volumeClaimTemplates: [{
            metadata: { name: "db-data" },
            spec: {
                accessModes: ["ReadWriteOnce"],
                storageClassName: "standard",
                resources: { requests: { storage: "10Gi" } },
            },
        }],
    },
}, { provider: k8sProvider });

// Helper function for database URLs
const makeDbUrl = (databaseName: string) => 
    pulumi.interpolate`postgres://${postgresUser}:${postgresPassword}@db-0.db.${appNamespace.metadata.name}.svc.cluster.local:5432/${databaseName}`;

// Auth Service
const authDeployment = new k8s.apps.v1.Deployment("auth", {
    metadata: { 
        namespace: appNamespace.metadata.name,
        labels: { app: "auth" },
    },
    spec: {
        selector: { matchLabels: { app: "auth" } },
        template: {
            metadata: { labels: { app: "auth" } },
            spec: {
                containers: [{
                    livenessProbe: {
                        httpGet: {
                            path: "/healthz",
                            port: 4000,
                            scheme: "HTTP" // Use HTTP instead of HTTPS if possible
                        },
                        initialDelaySeconds: 30,
                        periodSeconds: 10,
                        timeoutSeconds: 5,
                        failureThreshold: 3
                    },
                    readinessProbe: {
                        httpGet: {
                            path: "/readyz",
                            port: 4000,
                            scheme: "HTTP"
                        },
                        initialDelaySeconds: 5,
                        periodSeconds: 5
                    },
                    name: "auth",
                    image: authImageRef,
                    ports: [{ containerPort: 8081 }],
                    env: [
                        { name: "DATABASE_URL", value: makeDbUrl("auth") },
                        { name: "PORT", value: "8081" },
                        { 
                            name: "SECRET_KEY", 
                            valueFrom: { 
                                secretKeyRef: { 
                                    name: appSecrets.metadata.name, 
                                    key: "JWT_SECRET" 
                                } 
                            } 
                        },
                        { 
                            name: "TEST_PASSWORD", 
                            valueFrom: { 
                                secretKeyRef: { 
                                    name: appSecrets.metadata.name, 
                                    key: "TEST_PASSWORD" 
                                } 
                            } 
                        },
                        { name: "SEED", value: "1" },
                    ],
                }],
            },
        },
    },
}, { 
    provider: k8sProvider,
    dependsOn: [dbStatefulSet] 
});

const authService = new k8s.core.v1.Service("auth", {
    metadata: { namespace: appNamespace.metadata.name },
    spec: {
        selector: { app: "auth" },
        ports: [{ port: 8081, targetPort: 8081 }],
    },
}, { provider: k8sProvider });

// Products Service
const productsDeployment = new k8s.apps.v1.Deployment("products", {
    metadata: { 
        namespace: appNamespace.metadata.name,
        labels: { app: "products" },
    },
    spec: {
        selector: { matchLabels: { app: "products" } },
        template: {
            metadata: { labels: { app: "products" } },
            spec: {
                containers: [{
                    livenessProbe: {
                        httpGet: {
                            path: "/healthz",
                            port: 4000,
                            scheme: "HTTP" // Use HTTP instead of HTTPS if possible
                        },
                        initialDelaySeconds: 30,
                        periodSeconds: 10,
                        timeoutSeconds: 5,
                        failureThreshold: 3
                    },
                    readinessProbe: {
                        httpGet: {
                            path: "/readyz",
                            port: 4000,
                            scheme: "HTTP"
                        },
                        initialDelaySeconds: 5,
                        periodSeconds: 5
                    },
                    name: "products",
                    image: productsImageRef,
                    ports: [{ containerPort: 8082 }],
                    env: [
                        { name: "DATABASE_URL", value: makeDbUrl("products") },
                        { name: "PORT", value: "8082" },
                        { 
                            name: "SECRET_KEY", 
                            valueFrom: { 
                                secretKeyRef: { 
                                    name: appSecrets.metadata.name, 
                                    key: "JWT_SECRET" 
                                } 
                            } 
                        },
                        { name: "SEED", value: "1" },
                    ],
                }],
            },
        },
    },
}, { 
    provider: k8sProvider,
    dependsOn: [dbStatefulSet] 
});

const productsService = new k8s.core.v1.Service("products", {
    metadata: { namespace: appNamespace.metadata.name },
    spec: {
        selector: { app: "products" },
        ports: [{ port: 8082, targetPort: 8082 }],
    },
}, { provider: k8sProvider });

// Gateway Service
// const gatewayConfigMap = new k8s.core.v1.ConfigMap("gateway-config", {
//     metadata: { namespace: appNamespace.metadata.name },
//     data: { "supergraph.graphql": supergraphConfig },
// }, { provider: k8sProvider });

const gatewayDeployment = new k8s.apps.v1.Deployment("gateway", {
    metadata: { 
        namespace: appNamespace.metadata.name,
        labels: { app: "gateway" },
    },
    spec: {
        selector: { matchLabels: { app: "gateway" } },
        template: {
            metadata: { labels: { app: "gateway" } },
            spec: {
                containers: [{
                    name: "gateway",
                    image: gatewayImageRef,
                    ports: [{ containerPort: 4000 }],
                    env: [
                        { 
                            name: "SECRET_KEY", 
                            valueFrom: { 
                                secretKeyRef: { 
                                    name: appSecrets.metadata.name, 
                                    key: "JWT_SECRET" 
                                } 
                            } 
                        },
                        { 
                            name: "AUTH_URI", 
                            value: pulumi.interpolate`http://${authService.metadata.name}:${authService.spec.ports[0].port}` 
                        },
                        { 
                            name: "PRODUCTS_URI", 
                            value: pulumi.interpolate`http://${productsService.metadata.name}:${productsService.spec.ports[0].port}` 
                        },
                    ],
                    resources: {
                        requests: { cpu: "100m", memory: "128Mi" },
                        limits: { cpu: "500m", memory: "512Mi" },
                    },
                    livenessProbe: {
                        httpGet: {
                            path: "/healthz",
                            port: 4000,
                            scheme: "HTTP" // Use HTTP instead of HTTPS if possible
                        },
                        initialDelaySeconds: 30,
                        periodSeconds: 10,
                        timeoutSeconds: 5,
                        failureThreshold: 3
                    },
                    readinessProbe: {
                        httpGet: {
                            path: "/readyz",
                            port: 4000,
                            scheme: "HTTP"
                        },
                        initialDelaySeconds: 5,
                        periodSeconds: 5
                    },
                    // volumeMounts: [{
                    //     mountPath: "/supergraph.graphql",
                    //     name: "supergraph",
                    //     subPath: "supergraph.graphql",
                    // }],
                }],
                // volumes: [{
                //     name: "supergraph",
                //     configMap: { name: gatewayConfigMap.metadata.name },
                // }],
            },
        },
    },
}, { provider: k8sProvider });

const gatewayService = new k8s.core.v1.Service("gateway", {
    metadata: { namespace: appNamespace.metadata.name },
    spec: {
        type: "LoadBalancer",
        selector: { app: "gateway" },
        ports: [{ port: 4000, targetPort: 4000 }],
    },
}, { provider: k8sProvider });

// Exports
export const gatewayUrl = pulumi.interpolate`http://${gatewayService.status.loadBalancer.ingress[0].ip}:4000`;
export const authImageUri = authImageRef;
export const productsImageUri = productsImageRef;
export const gatewayImageUri = gatewayImageRef;