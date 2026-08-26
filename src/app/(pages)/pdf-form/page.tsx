"use client";

import { motion } from "framer-motion";

// Next.js port of Navbar/PDFForm.jsx (default export DownloadPDFButton).
// Same PDF download, example images, and email copy — presented as a
// full page for the /pdf-form footer route, with Framer Motion entrance.

const PDF_URL =
  "https://raw.githubusercontent.com/Gotcha1001/My-Images-for-sites-Wes/main/Website%20Client%20Form1.pdf";

const EXAMPLE_IMAGES = [
  {
    src: "https://github.com/Gotcha1001/My-Images-for-sites-Wes/blob/main/codenow1.jpg?raw=true",
    alt: "Example 1",
  },
  {
    src: "https://images.pexels.com/photos/97077/pexels-photo-97077.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Example 2",
  },
  {
    src: "https://images.pexels.com/photos/5935788/pexels-photo-5935788.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Example 3",
  },
];

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function PdfFormPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="gradient-background2 w-full max-w-3xl rounded-lg p-8 text-center shadow-lg"
      >
        <h1 className="mb-8 animate-bounce rounded-lg p-3 text-3xl font-bold text-purple-700 hover:bg-black">
          Download the Website Requirements Form
        </h1>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={gridVariants}
          className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
        >
          {EXAMPLE_IMAGES.map((img) => (
            <motion.img
              key={img.alt}
              variants={itemVariants}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
              src={img.src}
              alt={img.alt}
              className="mx-auto h-32 w-32 rounded-full object-cover shadow-neon"
            />
          ))}
        </motion.div>

        <a
          href={PDF_URL}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mb-6 block max-w-xs rounded-full bg-purple-500 px-4 py-3 text-white shadow-lg transition duration-300 hover:bg-purple-700"
        >
          Download PDF
        </a>

        <div className="mt-6 text-lg text-gray-100">
          Complete the form and send it to{" "}
          <a
            href="mailto:CodeNow101@gmail.com"
            className="font-bold text-purple-700"
          >
            CodeNow101@gmail.com
          </a>
          .
        </div>

        <div className="mt-4 text-lg text-gray-100">
          We&apos;ll get back to you and start building your requirements for
          your custom website.
        </div>
      </motion.div>
    </div>
  );
}
