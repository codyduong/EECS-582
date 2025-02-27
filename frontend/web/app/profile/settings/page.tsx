"use client";

/*
 *  Page at "/profile/settings"
 *
 *  Authors: @codyduong
 *  Date Created: 2025-02-26
 *  Revision History:
 *  - 2025-02-26 - @codyduong - create profile pages
 */

import { useEffect, useState, useCallback } from "react";
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  TextInput,
  PasswordInput,
  Switch,
  Stack,
  Divider,
  Select,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Effect } from "effect";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { fetchUserSettings, saveUserSettings, UserSettings } from "./mock";
import { useUser } from "@/contexts/UserContext";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [_initialValues, setInitialValues] = useState<UserSettings | null>(
    null,
  );
  const router = useRouter();
  const { user } = useUser();

  const form = useForm({
    initialValues: {
      name: user?.username ?? "",
      email: user?.email ?? "",
      phone: "",
      password: "",
      confirmPassword: "",
      notificationsEnabled: false,
      darkModeEnabled: false,
      emailNotifications: false,
      pushNotifications: false,
      language: "en",
      currency: "usd",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords do not match" : null,
    },
  });

  useEffect(() => {
    // Fetch user settings
    Effect.runPromise(fetchUserSettings)
      .then((data) => {
        const composed = { ...form.getValues(), ...data };

        setInitialValues(composed);
        form.setValues(composed);
        form.resetDirty();
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user settings:", error);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(
    async (values: typeof form.values) => {
      try {
        setSaving(true);

        const result = await Effect.runPromise(saveUserSettings);

        if (result.success) {
          notifications.show({
            title: "Success",
            message: result.message,
            color: "green",
            icon: <IconCheck />,
          });

          setInitialValues(values);
          form.resetDirty();
          notifications.hide("unsaved-changes"); // Hide the unsaved changes notification if it exists
        }
      } catch (_error) {
        notifications.show({
          title: "Error",
          message: "Failed to save settings. Please try again.",
          color: "red",
          icon: <IconX />,
        });
      } finally {
        setSaving(false);
      }
    },
    [form],
  );

  // Handle navigation away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.isDirty()) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [form]);

  // Handle tab navigation with unsaved changes
  const handleRouteChange = useCallback(() => {
    if (form.isDirty()) {
      notifications.show({
        title: "Unsaved Changes",
        message:
          "You have unsaved changes. Would you like to save them before leaving?",
        color: "yellow",
        autoClose: false,
        withCloseButton: true,
        className: "unsaved-changes-notification",
        id: "unsaved-changes",
        styles: (theme) => ({
          root: {
            backgroundColor: theme.colors.yellow[1],
            borderColor: theme.colors.yellow[6],
          },
          title: { color: theme.colors.yellow[9] },
          description: { color: theme.colors.yellow[9] },
          closeButton: {
            color: theme.colors.yellow[9],
            "&:hover": { backgroundColor: theme.colors.yellow[2] },
          },
        }),
        onClose: () => {
          form.reset();
          router.push("/profile");
        },
      });
    }
  }, [form, router]);

  // Update the useEffect hook for handling tab navigation
  useEffect(() => {
    return () => {
      if (form.isDirty()) {
        // handleRouteChange();
      }
    };
  }, [form, handleRouteChange]);

  if (loading) {
    return (
      <Paper p="md" radius="md" className="min-h-[80vh] max-w-2xl mx-auto">
        <Title order={2} className="mb-6">
          Account Settings
        </Title>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" className="flex-grow max-w-2xl mx-auto">
      <div className="flex flex-row flex-nowrap">
        <Title order={2} className="mb-6 flex-grow inline">
          Account Settings
        </Title>

        <div>
          <Button variant="filled" color="red">
            Logout
          </Button>
        </div>
      </div>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <div>
            <Title order={4} className="mb-4">
              Personal Information
            </Title>
            <Stack>
              <TextInput
                label="Username"
                placeholder="Your username"
                {...form.getInputProps("username")}
              />

              <TextInput
                label="Email"
                disabled
                {...form.getInputProps("email")}
              />

              <TextInput
                label="Phone Number"
                disabled
                placeholder="+1 (555) 123-4567"
                {...form.getInputProps("phone")}
              />
            </Stack>
          </div>

          <Divider />

          <div>
            <Title order={4} className="mb-4">
              Password
            </Title>
            <Stack>
              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                {...form.getInputProps("password")}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm new password"
                {...form.getInputProps("confirmPassword")}
              />
            </Stack>
          </div>

          <Divider />

          <div>
            <Title order={4} className="mb-4">
              Preferences
            </Title>
            <Stack>
              <Group>
                <Text>Enable Dark Mode</Text>
                <Switch
                  disabled
                  {...form.getInputProps("darkModeEnabled", {
                    type: "checkbox",
                  })}
                />
              </Group>

              <Group>
                <Text>Enable Notifications</Text>
                <Switch
                  disabled
                  {...form.getInputProps("notificationsEnabled", {
                    type: "checkbox",
                  })}
                />
              </Group>

              <Box ml={20}>
                <Group className="mb-2">
                  <Text>Email Notifications</Text>
                  <Switch
                    disabled={true || !form.values.notificationsEnabled}
                    {...form.getInputProps("emailNotifications", {
                      type: "checkbox",
                    })}
                  />
                </Group>

                <Group>
                  <Text>Push Notifications</Text>
                  <Switch
                    disabled={true || !form.values.notificationsEnabled}
                    {...form.getInputProps("pushNotifications", {
                      type: "checkbox",
                    })}
                  />
                </Group>
              </Box>
            </Stack>
          </div>

          <Divider />

          <div>
            <Title order={4} className="mb-4">
              Regional Settings
            </Title>
            <Stack>
              <Select
                label="Language"
                placeholder="Select language"
                disabled
                data={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Spanish" },
                  { value: "fr", label: "French" },
                  { value: "de", label: "German" },
                ]}
                {...form.getInputProps("language")}
              />

              <Select
                label="Currency"
                placeholder="Select currency"
                disabled
                data={[
                  { value: "usd", label: "USD ($)" },
                  { value: "eur", label: "EUR (€)" },
                  { value: "gbp", label: "GBP (£)" },
                  { value: "jpy", label: "JPY (¥)" },
                ]}
                {...form.getInputProps("currency")}
              />
            </Stack>
          </div>

          <Group mt="xl" className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => form.reset()}
              disabled={!form.isDirty()}
            >
              Reset
            </Button>
            <Button type="submit" loading={saving} disabled={!form.isDirty()}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
