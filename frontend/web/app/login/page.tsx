"use client";

/*
 *  Page at "/login"
 *
 *  Authors: @codyduong
 *  Date Created: 2025-02-20
 *  Revision History:
 *  - 2025-02-20 - @codyduong - initial creation of website
 *  - 2025-02-25 - @hvwendt - create login page
 *  - 2025-02-26 - @codyduong - consolidate login logic within UserContext
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
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Effect } from "effect";
import { useUser } from "@/contexts/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useUser();

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

      // Run login in background context, will error if fail for any reason.
      // Otherwise will store in secure cookies if successful
      await Effect.runPromise(login(values.email, values.password));

      // For now go to profile page
      router.push("/profile");
    } catch (err) {
      // todo @codyduong, effectize this away from a promise, we can have much more meaningful error messages for the user
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
