"use client";

import { useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";

// Next.js port of Navbar/WebsiteDesignForm.jsx.
// Same Formspree POST form + page checkboxes. Logo path: put codenow1.jpg
// in public/ (or update src). Replace the Formspree action id with yours.

const PAGE_OPTIONS = [
  "Home",
  "About Us",
  "Services",
  "Products",
  "Portfolio",
  "Blog",
  "Contact Us",
  "Pricing",
  "Other",
] as const;

export default function WebsiteDesignFormPage() {
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  const handlePageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedPages((prev) =>
      prev.includes(value)
        ? prev.filter((page) => page !== value)
        : [...prev, value],
    );
  };

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-4xl rounded-lg bg-gray-100 p-8 shadow-lg"
      >
        <div className="mb-8 flex items-center justify-center">
          {/* Place codenow1.jpg in public/ (old Vite import /codenow1.jpg) */}
          <img src="/codenow1.jpg" alt="Logo" className="h-24 w-auto" />
        </div>

        <h2 className="mb-6 text-3xl font-bold text-purple-800">
          Website Design Requirements Form
        </h2>

        <form
          id="websiteDesignForm"
          method="POST"
          action="https://formspree.io/f/your-form-id"
          className="space-y-6"
        >
          {/* Website Information */}
          <section className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 text-2xl font-semibold text-purple-700">
              Website Information:
            </h3>

            <div>
              <label
                htmlFor="designStyle"
                className="block text-lg font-medium text-gray-800"
              >
                Design Style:
              </label>
              <textarea
                id="designStyle"
                name="designStyle"
                rows={3}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
              />
            </div>

            <div className="mt-4">
              <label className="block text-lg font-medium text-gray-800">
                Images:
              </label>
              <div className="mt-2 flex items-center">
                <input
                  type="radio"
                  id="imagesYes"
                  name="imagesProvided"
                  value="Yes"
                  className="mr-2"
                  required
                />
                <label htmlFor="imagesYes" className="mr-4">
                  Yes, I have images.
                </label>
                <input
                  type="radio"
                  id="imagesNo"
                  name="imagesProvided"
                  value="No"
                  className="mr-2"
                  required
                />
                <label htmlFor="imagesNo">
                  No, I need you to source images.
                </label>
              </div>
              <textarea
                id="imagesDetails"
                name="imagesDetails"
                rows={3}
                placeholder="If yes, please provide details."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="navBar"
                className="block text-lg font-medium text-gray-800"
              >
                Navigation Bar:
              </label>
              <textarea
                id="navBar"
                name="navBar"
                rows={3}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="footer"
                className="block text-lg font-medium text-gray-800"
              >
                Footer:
              </label>
              <textarea
                id="footer"
                name="footer"
                rows={3}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
              />
            </div>
          </section>

          {/* Website Structure */}
          <section className="mt-6 rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 text-2xl font-semibold text-purple-700">
              Website Structure:
            </h3>
            <div>
              <label className="block text-lg font-medium text-gray-800">
                Pages:
              </label>
              <div className="mt-2 flex flex-wrap gap-4">
                {PAGE_OPTIONS.map((page) => (
                  <label key={page} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="pages"
                      value={page}
                      checked={selectedPages.includes(page)}
                      onChange={handlePageChange}
                      className="form-checkbox"
                    />
                    <span className="text-gray-700">{page}</span>
                    {page === "Other" && (
                      <input
                        type="text"
                        name="otherPagesSpecify"
                        placeholder="Specify other pages"
                        className="ml-2 rounded-md border-gray-300 shadow-sm"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="mt-6 rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 text-2xl font-semibold text-purple-700">
              Content:
            </h3>
            <div>
              <label
                htmlFor="homePage"
                className="block text-lg font-medium text-gray-800"
              >
                Home Page:
              </label>
              <textarea
                id="homePage"
                name="homePage"
                rows={3}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="otherPages"
                className="block text-lg font-medium text-gray-800"
              >
                Other Pages:
              </label>
              <textarea
                id="otherPages"
                name="otherPages"
                rows={3}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
              />
            </div>
          </section>

          {/* Functionality */}
          <section className="mt-6 rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 text-2xl font-semibold text-purple-700">
              Functionality:
            </h3>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="authYes"
                  name="authFunctionality"
                  value="Yes"
                  className="mr-2"
                  required
                />
                <label htmlFor="authYes" className="mr-4">
                  Yes, I need user login and registration functionality.
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="authNo"
                  name="authFunctionality"
                  value="No"
                  className="mr-2"
                  required
                />
                <label htmlFor="authNo">
                  No, I do not need user login functionality.
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-lg font-medium text-gray-800">
                User Email Form:
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="emailFormYes"
                    name="emailForm"
                    value="Yes"
                    className="mr-2"
                    required
                  />
                  <label htmlFor="emailFormYes" className="mr-4">
                    Yes, I need a user email form on contacts.
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="emailFormNo"
                    name="emailForm"
                    value="No"
                    className="mr-2"
                    required
                  />
                  <label htmlFor="emailFormNo">
                    No, I do not need a user email form.
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Attachments */}
          <section className="mt-6 rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 text-2xl font-semibold text-purple-700">
              Attachments:
            </h3>
            <p className="mb-2 text-gray-800">
              Please attach any relevant documents, images, or files that would
              help in the website design process. Create a file on a memory
              stick that I can work with.
            </p>
            <input
              type="file"
              id="attachments"
              name="attachments"
              multiple
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </section>

          {/* Client Signature */}
          <section className="mt-6 rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-4 text-2xl font-semibold text-purple-700">
              Client Signature:
            </h3>
            <div>
              <label
                htmlFor="clientName"
                className="block text-lg font-medium text-gray-800"
              >
                Name:
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="clientDate"
                className="block text-lg font-medium text-gray-800"
              >
                Date:
              </label>
              <input
                type="date"
                id="clientDate"
                name="clientDate"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
              />
            </div>
          </section>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              Submit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
