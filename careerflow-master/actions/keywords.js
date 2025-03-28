"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function suggestKeywords({ jobDescription }) {
  const { userId } = await auth();
  // console.log(userId);
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true
    }
  });
  if (!user) throw new Error("User not found");
  // const user.industry = 'WEB DEV';

  const prompt = `
    Given the following job description and user industry, extract relevant keywords (skills, tools, certifications, etc.) that should be included in a resume to make it ATS-friendly. Return the keywords as a comma-separated list.

    Job Description: ${jobDescription}
    User Industry: ${user.industry}
  `;
  const result = await model.generateContent(prompt);
  const keywords = result.response.text().trim();
  return keywords;
}


