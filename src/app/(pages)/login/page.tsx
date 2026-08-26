"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { LogIn, Mail, Lock, LogOut, AlertCircle } from "lucide-react";

import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "@/lib/firebaseConfig";
import type { User } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { playClickSound } from "@/lib/playSound";

// Next.js port of Navbar/Login.jsx.
// Same auth flow (email/password + Google + MailerLite subscribe), same
// redirect-on-auth behavior, same "admin@example.com bypasses email
// verification" rule -- just Next routing, shadcn UI and motion added.

function capitalizeName(name?: string | null) {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Clear the form as part of the same transition, not a
        // separate effect reacting to `user` (avoids the cascading
        // render React warns about).
        setEmail("");
        setPassword("");
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const loggedInUser = userCredential.user;

      // Bypass email verification for admin@example.com
      if (email !== "admin@example.com" && !loggedInUser.emailVerified) {
        await signOut(auth);
        setErrorMessage("Please verify your email before trying to log in.");
        return;
      }

      router.push("/");
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password") {
        setErrorMessage(
          "Incorrect email or password. Please try again or register.",
        );
      } else {
        setErrorMessage("Error logging in user: Please check your password");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const signInWithGoogle = async () => {
    setErrorMessage("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      // Send user email to MailerLite -- ported as-is from the original.
      const response = await axios.post(
        "https://connect.mailerlite.com/api/subscribers",
        {
          email: googleUser.email,
          fields: {
            name: googleUser.displayName,
          },
          groups: ["128641737161704712"],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiZmMxNTA4ZjYyNjg2NTYwZGVkODBlOGIxZjYxMzY1NTc5ZWQ3NTJmMDYyYjI4NzA5NzlhNDVkMzY3MTNiZGM1Nzc2OWZjNzdmMDhjZjE2ZTIiLCJpYXQiOjE3MjI5NjU4MTguMjg2ODA2LCJuYmYiOjE3MjI5NjU4MTguMjg2ODA3LCJleHAiOjQ4Nzg2Mzk0MTguMjg0MzY0LCJzdWIiOiIxMDU4MDM5Iiwic2NvcGVzIjpbXX0.C7f3Ees3buuF7Kz348u_psytcUspR2nUoAkj1E2Lnw5OoSs-YFvn0sPtzhIty13s8wKZ7uAxP4CjgYWvDlxyfIL-UZg91bdJykkSi8q2B0DAqMPHKfa5oy4ACQZbTTTxQUfAvgrqWwF-02ORpGeFrG8-rSNzKiK7ItkYbbxZpjawj9XjwXWkk6so1tFD-0AlaaQyekKRNYk9DEerx9EzdGv0w6ckn2IjYc5DcnP9DXZDKRm9LA0VwVJNNFMjV3Jr-n236I7z2GJ7Yc6kLzot_Vg_QahnSYkAvslt7iTeh6GBJBaRtRLhb5HOVeM3sQIR-KfELew5_Qs8PtmAWFmJFYnF5aCVXMyELQTtmANyI5E_cOElmw7rcYJIiyaxUxCIXewsUCCmvsI2a07P4t_saqK7uYD1Cv0b_nsQeI9Qllt_-bDjzSbZKNACcL4tivIh_daaURZ2bucXnCeObePwDfEkjyv-_i_VAyc-194njCTEdJfhp4tFP2ktr4sOeznk8KtNEYj3mZ0naGtdF2yq6tZaisVccDz7W1TL-wD4mPsGF_hE6v4ZXwCSJX_p5BWlVyTNJzy1Vv4xSv-wdDMsmVTwt0-P9iSECNUgLqkHRdU2oqOi1wAlryH26pFsYhvmJHaTtxgtUZJlEcibLaE5On11DQwZ1HIX0GK0XJW9A5U",
          },
        },
      );
      console.log("MailerLite response:", response);

      router.push("/");
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setEmail("");
      setPassword("");
      setErrorMessage("");
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-red-600 to-yellow-500 px-4">
      <AnimatePresence mode="wait">
        {user ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-center"
          >
            <h2 className="mb-4 text-2xl font-bold text-white">
              Welcome,{" "}
              {user.displayName ? capitalizeName(user.displayName) : user.email}
            </h2>
            <Button
              onClick={() => {
                playClickSound();
                logout();
              }}
              className="gap-2 bg-teal-500 text-teal-950 hover:bg-teal-400"
              size="lg"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.97 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="border-white/10 bg-black/80 shadow-2xl backdrop-blur">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-white">
                  Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  {errorMessage && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="flex items-center gap-2 overflow-hidden text-sm text-red-400"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorMessage}
                    </motion.p>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={handleLogin}
                  autoComplete="off"
                  className="space-y-4"
                >
                  <div className="text-left">
                    <Label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <Label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        className="pl-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={submitting}
                      onClick={() => playClickSound()}
                      className="w-full gap-2 bg-gray-800 hover:bg-gray-900"
                    >
                      <LogIn className="h-4 w-4" />
                      {submitting ? "Logging in..." : "Login"}
                    </Button>
                  </motion.div>
                </form>

                <motion.div whileTap={{ scale: 0.98 }} className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      playClickSound();
                      signInWithGoogle();
                    }}
                    className="w-full bg-teal-600 text-white hover:bg-teal-700"
                  >
                    Login with Google
                  </Button>
                </motion.div>

                <div className="mt-4 text-center">
                  <Link
                    href="/reset-password"
                    onClick={() => playClickSound()}
                    className="text-sm text-teal-400 transition duration-300 ease-in-out hover:text-yellow-400"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
