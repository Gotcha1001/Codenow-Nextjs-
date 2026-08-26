"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AlertCircle, UserPlus } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";

import {
  auth,
  db,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from "@/lib/firebaseConfig";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { playClickSound } from "@/lib/playSound";

// Next.js port of Navbar/Register.jsx. Same validation rules, same
// Firestore user doc + MailerLite subscribe + email-verification flow,
// same "sign out then redirect to /login" ending -- shadcn UI, framer
// motion and a couple of nicer touches (password-match hint, inline
// errors instead of alert()) layered on top.

type Gender = "male" | "female" | "other" | "";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (
      !firstName ||
      !lastName ||
      !gender ||
      !dateOfBirth ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("Please enter all fields");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (!termsAccepted) {
      setErrorMessage("Please accept the terms and conditions");
      return;
    }

    setSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Save user details to Firestore
      const userRef = collection(db, "users");
      await addDoc(userRef, {
        uid: user.uid,
        firstName,
        lastName,
      });

      // Add user to MailerLite -- ported as-is from the original.
      await axios.post(
        "https://connect.mailerlite.com/api/subscribers",
        {
          email,
          fields: {
            name: `${firstName} ${lastName}`,
            gender,
            dateOfBirth,
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

      await sendEmailVerification(user);

      setFirstName("");
      setLastName("");
      setGender("");
      setDateOfBirth("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setTermsAccepted(false);
      setErrorMessage("");

      // Sign out the user after registration, then send them to login.
      await signOut(auth);
      alert("Registered successfully. Please verify your email.");
      router.push("/login");
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      const message =
        (error as { message?: string })?.message ?? "Unknown error";
      if (code === "auth/email-already-in-use") {
        setErrorMessage("Email is already registered");
      } else {
        setErrorMessage("Error registering user: " + message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(e.target.checked);
  };

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-teal-600 to-purple-900 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-white/10 bg-black/80 shadow-2xl backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-white">
              Register
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
              onSubmit={handleRegister}
              autoComplete="off"
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <Label
                    htmlFor="first-name"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    First Name
                  </Label>
                  <Input
                    type="text"
                    id="first-name"
                    name="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="text-left">
                  <Label
                    htmlFor="last-name"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Last Name
                  </Label>
                  <Input
                    type="text"
                    id="last-name"
                    name="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="text-left">
                <Label
                  htmlFor="gender"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Gender
                </Label>
                <div className="flex items-center gap-4">
                  {(["male", "female", "other"] as const).map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 text-sm capitalize text-white"
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        className="h-4 w-4 accent-teal-500"
                        checked={gender === option}
                        onChange={(e) => setGender(e.target.value as Gender)}
                        required
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="text-left">
                <Label
                  htmlFor="date-of-birth"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Date of Birth
                </Label>
                <Input
                  type="date"
                  id="date-of-birth"
                  name="date-of-birth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>

              <div className="text-left">
                <Label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="text-left">
                <Label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-white"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="text-left">
                <Label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    name="confirm-password"
                    className={`pr-10 ${passwordsMismatch ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-white"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <AnimatePresence>
                  {passwordsMismatch && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 overflow-hidden text-xs text-red-400"
                    >
                      Passwords do not match
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-left">
                <label className="flex items-start gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-teal-500"
                    checked={termsAccepted}
                    onChange={handleCheckboxChange}
                    required
                  />
                  <span>
                    I accept the{" "}
                    <Link
                      href="/terms"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      terms and conditions
                    </Link>
                  </span>
                </label>
              </div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={submitting}
                  onClick={() => playClickSound()}
                  className="w-full gap-2 bg-blue-500 hover:bg-blue-600"
                >
                  <UserPlus className="h-4 w-4" />
                  {submitting ? "Registering..." : "Register"}
                </Button>
              </motion.div>
            </form>

            <p className="mt-4 text-center text-sm text-white">
              Already have an account?{" "}
              <Link
                href="/login"
                onClick={() => playClickSound()}
                className="text-blue-400 underline hover:text-blue-300"
              >
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
