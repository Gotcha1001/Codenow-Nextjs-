"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import Spinner from "@/lib/spinner";

// Next.js port of Navbar/Cv.jsx (exported as ProfileCard).
// Same personal details, qualifications, skills, work history, general
// awards, and references — Next Link for /certificates, shared Spinner,
// Framer Motion on sections, settings/"cv" background video.

const ADMIN_EMAIL = "admin@example.com";

type BackgroundSettings = {
  backgroundMediaUrl?: string;
  isBackgroundVideo?: boolean;
};

function ProfileCardSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-center text-2xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function QualificationCard({
  year,
  institution,
  qualification,
  details,
}: {
  year: string;
  institution: string;
  qualification: string;
  details?: string;
}) {
  return (
    <div className="mb-8 rounded-lg bg-gray-900 p-4 shadow-neon transition duration-300 hover:bg-black">
      <div className="mb-2 flex justify-between">
        <span className="font-semibold">{year}</span>
        <span className="font-semibold">{institution}</span>
      </div>
      <div>
        <strong>{qualification}</strong>
        {details && <p>{details}</p>}
      </div>
    </div>
  );
}

function ExperienceCard({
  year,
  title,
  details,
}: {
  year: string;
  title: string;
  details: string[];
}) {
  return (
    <div className="mb-8 rounded-lg bg-gray-900 p-4 shadow-neon transition duration-300 hover:bg-black">
      <div className="mb-2 flex justify-between">
        <span className="font-semibold">{year}</span>
        <span className="font-semibold">{title}</span>
      </div>
      <div>
        {details.map((detail) => (
          <p key={detail}>{detail}</p>
        ))}
      </div>
    </div>
  );
}

function ReferenceCard({
  name,
  role,
  contact,
}: {
  name: string;
  role: string;
  contact: string;
}) {
  return (
    <div className="mb-8 rounded-lg bg-gray-900 p-4 shadow-neon transition duration-300 hover:bg-black">
      <div className="mb-2 flex justify-between">
        <span className="font-semibold">{name}</span>
        <span className="font-semibold">{role}</span>
      </div>
      <div>
        <strong>{contact}</strong>
      </div>
    </div>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

export default function CvPage() {
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string>("");
  const [showBackgroundDialog, setShowBackgroundDialog] =
    useState<boolean>(false);
  const [newVideoUrl, setNewVideoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });

    const fetchBackgroundVideoUrl = async () => {
      try {
        const docRef = doc(collection(db, "settings"), "cv");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as BackgroundSettings;
          if (data.backgroundMediaUrl) {
            setBackgroundVideoUrl(data.backgroundMediaUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching background video URL:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBackgroundVideoUrl();
    return () => unsubscribe();
  }, []);

  const openBackgroundDialog = () => {
    setNewVideoUrl(backgroundVideoUrl);
    setShowBackgroundDialog(true);
  };

  const closeBackgroundDialog = () => setShowBackgroundDialog(false);

  const changeBackgroundVideo = async () => {
    try {
      const docRef = doc(collection(db, "settings"), "cv");
      await setDoc(docRef, {
        backgroundMediaUrl: newVideoUrl,
        isBackgroundVideo: true,
      });
      setBackgroundVideoUrl(newVideoUrl);
      setNewVideoUrl("");
      closeBackgroundDialog();
    } catch (err) {
      console.error("Error updating background video URL:", err);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      {backgroundVideoUrl && (
        <video
          src={backgroundVideoUrl}
          autoPlay
          loop
          muted
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto mb-3 mt-3 max-w-4xl rounded-lg bg-black p-6 text-white shadow-sky"
      >
        <div className="mb-6 flex justify-center">
          {/* Keep public/Cv.jpg in the Next public folder (same as old /Cv.jpg) */}
          <img
            src="/Cv.jpg"
            alt="Profile Picture"
            width={150}
            height={150}
            className="zoom rounded-full shadow-neon"
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionVariants}
        >
          <ProfileCardSection title="Personal Details">
            <div className="mb-10 mt-8 animate-bounce text-center">
              <Link
                href="/certificates"
                className="rounded-lg bg-purple-600 p-3 text-center text-white"
              >
                View My Certificates
              </Link>
            </div>
            <ul className="mb-8 space-y-2 rounded-lg bg-gray-900 p-4 shadow-md transition duration-300 hover:bg-black">
              <li>
                <strong>NAME:</strong> Wesley Wayne Olivier
              </li>
              <li>
                <strong>ADDRESS:</strong> 110 Manfred Drive, ParkHills, Durban
                North, 4051
              </li>
              <li>
                <strong>CELL. NO.:</strong> 078-0077368 (alternative 083
                4487334)
              </li>
              <li>
                <strong>DATE OF BIRTH:</strong> 22 January 1982
              </li>
              <li>
                <strong>MARITAL STATUS:</strong> Single
              </li>
              <li>
                <strong>ID NUMBER:</strong> 820122 5120 084
              </li>
            </ul>
          </ProfileCardSection>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <ProfileCardSection title="Qualifications">
            <div className="space-y-4">
              <QualificationCard
                year="1999"
                institution="SOUTH PENINSULA COLLEGE"
                qualification="National Intermediate Certificate"
              />
              <QualificationCard
                year="2000"
                institution="SOUTH PENINSULA COLLEGE"
                qualification="National Senior Certificate"
                details="Subjects: English 1st Language, Afrikaans 2nd Language, Office Practice, Information Processing, Computer Practice, Small Business Management"
              />
              <QualificationCard
                year="2004 – 2007"
                institution="UKZN (University of Kwa-Zulu Natal) Howard Campus"
                qualification="Diploma in Jazz and Popular music"
                details="Subjects: Rhythm, Aural Perception, Ensemble, Improvisation, Harmony, Arranging, First Practical Study (Piano), English, Keyboard tech"
              />
              <QualificationCard
                year="2008"
                institution="UKZN (University of Kwa-Zulu Natal) Howard Campus"
                qualification="BPMus Jazz and popular music (Honours Degree)"
                details="Subjects: Performance, Electro acoustics (Sound Engineering)"
              />
              <QualificationCard
                year="2020"
                institution="The TEFL Academy (RQF)"
                qualification="Qualifi Level 5 Certificate in Teaching English as a Foreign Language (168 hours)"
              />
              <QualificationCard
                year="2020"
                institution="The TEFL Academy (RQF)"
                qualification="Teaching English Online and One to One course (30 hours)"
              />
              <QualificationCard
                year="2021 – 2023"
                institution="Udemy"
                qualification="Various Programming Courses"
                details="C# Fundamentals, C# Intermediate, C# Advanced Topics, Angular and Asp.Net Core Rest API, ASPNet Core and Angular Dating App"
              />
            </div>
          </ProfileCardSection>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <ProfileCardSection title="Programming Skills">
            <ul className="rounded-lg bg-gray-900 p-4 transition duration-300 hover:bg-black">
              <li>C# and Typescript, using Angular and VS Code</li>
              <li>
                ASP.Net Core: Route Guards, Custom Directives, Headers, SignalR,
                Bootstrap, Services, Async Pipe, Observables, Components,
                Templates, Basic HTML and TypeScript, Parent-Child Components,
                Basic CSS, Setting up Routes, Toastr Service, Interceptors,
                Model State Errors, Async Validators
              </li>
              <li>
                API: Domain models, Dependency Injection, Adding Services,
                Repository Pattern, Error Handling, Identity ASP.Net Identity
                and Role Management, CRUD Operations, Authentication,
                Authorization, Swagger and Postman, Request DTOs, Controllers,
                Endpoints, DB Context, Asynchronous Programming, Interfaces,
                Repositories, JWT Tokens, Roles, CORS, Query Params, Cache,
                Paging, Sorting, Filtering, MVC, Web API Versioning
              </li>
              <li>
                Databases: SQL Server Management, SQLite, PostgreSQL (Fly.io)
              </li>
              <li>Photo Management: Cloudinary</li>
              <li>GitHub: Storing Repositories</li>
              <li>Docker: Creating Images, Redis</li>
            </ul>
          </ProfileCardSection>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <ProfileCardSection title="Work Experience">
            <div className="space-y-4">
              <ExperienceCard
                year="2009 – 2022"
                title="Durban School: Music Specialist"
                details={[
                  "Teaching Music Theory and Practice from Grade R to Grade 7",
                  "Teaching choir weekly",
                  "Performing at school functions as a cocktail pianist",
                  "Writing and performing original pieces for school events",
                ]}
              />
              <ExperienceCard
                year="2004 – 2007"
                title="CD Warehouse, Gateway Shopping Mall"
                details={[
                  "Selling CDs, operating the till, sealing stock",
                  "Packing and repacking shelves, placing orders",
                  "Dealing with demanding customers",
                ]}
              />
              <ExperienceCard
                year="2002"
                title="Beds for Africa Warehouse"
                details={[
                  "Taking stock of beds and furniture",
                  "Capturing invoices, receiving stock, packing, and organizing",
                ]}
              />
              <ExperienceCard
                year="2002"
                title="Standard Bank Assessors Home Loans Department"
                details={["Capturer and then Clerk"]}
              />
              <ExperienceCard
                year="2001"
                title="Zimbabalula (Zimbabwe Clothes Goods)"
                details={["Managed shop operations, stock, till, credit"]}
              />
              <ExperienceCard
                year="1997"
                title="Spargies"
                details={["Takeaways and delivery orders"]}
              />
            </div>
          </ProfileCardSection>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionVariants}
        >
          <ProfileCardSection title="General">
            <ul className="mb-8 list-disc space-y-2 rounded-lg bg-gray-900 pl-5 p-4 transition duration-300 hover:bg-black">
              <li>1996 – Victorix Ludorum – Overall Achiever</li>
              <li>1998 – Mr. Personality</li>
              <li>2001 – SRC Treasurer</li>
              <li>1996 – Head Boy – Thornton Road Primary School</li>
              <li>1997 – Best contribution to the school</li>
              <li>Computer Literacy – Word, Excel, Access, PowerPoint, SAP</li>
            </ul>
          </ProfileCardSection>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <ProfileCardSection title="References">
            <div className="space-y-4">
              <ReferenceCard
                name="Mrs. Wynne Paice"
                role="HOD, Durban North Primary School"
                contact="Tel.: 083 776 7062"
              />
              <ReferenceCard
                name="Mrs. Dawn Olive"
                role="HOD, Glenwood Prep"
                contact="Tel.: 083 777 0932"
              />
              <ReferenceCard
                name="Mrs. Liz Kemp"
                role="Headmaster, Parkhill Primary"
                contact="Tel.: 083 777 6009"
              />
              <ReferenceCard
                name="Miss Fiona Squires"
                role="Music Teacher, Atholl Heights Primary"
                contact="Tel.: 083 773 5441"
              />
              <ReferenceCard
                name="Mrs. Kath Hoad"
                role="HOD, Brighton Beach Senior Primary School"
                contact="Tel.: 083 776 7042"
              />
              <ReferenceCard
                name="Mrs. Erica Bush"
                role="HOD, Warner Beach Senior Primary School"
                contact="Tel.: 083 776 7066"
              />
            </div>
          </ProfileCardSection>
        </motion.div>

        <div className="mt-8 animate-bounce text-center">
          <Link
            href="/certificates"
            className="rounded-lg bg-purple-600 p-3 text-center text-white"
          >
            View My Certificates
          </Link>
        </div>

        {isAdmin && (
          <div className="mt-8 flex justify-center">
            <button
              className="rounded-md bg-indigo-800 px-4 py-2 text-white transition duration-300 hover:bg-green-600"
              onClick={openBackgroundDialog}
            >
              Change Background Video
            </button>
          </div>
        )}
      </motion.div>

      {showBackgroundDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-900 p-6 text-white shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
              Change Background Video
            </h2>
            <input
              type="text"
              placeholder="Enter video URL"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className="mb-4 w-full rounded border border-white/20 bg-neutral-800 p-2 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeBackgroundDialog}
                className="rounded bg-white/10 px-4 py-2 text-white/80 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={changeBackgroundVideo}
                className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
