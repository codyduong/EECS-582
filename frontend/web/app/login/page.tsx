"use client";

/*
 *  Page at "/login"
 *
 *  Authors: @codyduong
 *  Date Created: 2025-02-19
 *  Revision History:
 *  - 2025-02-05 - @codyduong - initial creation of website
 *  - 2025-02-25 - @hvwendt - create login page
 */

import "@mantine/core/styles.css";
import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Paper,
  Title,
  Container,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import bcrypt from "bcryptjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password should be at least 6 characters" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      setError("");

      // Hash password before sending
      const hashedPassword = await bcrypt.hash(values.password, 10);

      const response = await fetch("http://localhost:8081/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: hashedPassword,
          rememberMe: values.rememberMe,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Handle successful login
      if (data.token) {
        // Store the token in localStorage or a secure cookie

        // todo @codyduong, MOVE THIS into a context handler, and resolve issues
        // with localStorage... probably prefer something like react-cookie,
        // or the nextjs equivalent... CSRF is not really a concern since our
        // APIs are guarded with CORs
        localStorage.setItem("authToken", data.token);
        // Redirect to dashboard or home page
        router.push("/");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to login. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className="font-bold">
        Welcome back!
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="you@example.com"
            required
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            {...form.getInputProps("password")}
          />

          <Checkbox
            label="Remember me"
            mt="md"
            {...form.getInputProps("rememberMe", { type: "checkbox" })}
          />

          {error && <div className="mt-4 text-sm text-red-500">{error}</div>}

          <Button fullWidth mt="xl" type="submit" loading={loading}>
            Sign in
          </Button>
        </form>

        <Text ta="center" mt="md">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:text-blue-600">
            Register
          </Link>
        </Text>
      </Paper>
    </Container>
  );
}
