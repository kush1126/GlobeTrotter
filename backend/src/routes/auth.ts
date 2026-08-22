import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { name, email, password } = parsed.data;
  const cleanEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      currency: "USD",
      language: "en",
    },
  });

  const token = signToken(user.id);
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      currency: user.currency,
      language: user.language,
    },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;
  const cleanEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      currency: user.currency || "USD",
      language: user.language || "en",
    },
  });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      currency: true,
      language: true,
      createdAt: true,
    },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    ...user,
    currency: user.currency || "USD",
    language: user.language || "en",
  });
});

const updateMeSchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
});

authRouter.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      currency: true,
      language: true,
      createdAt: true,
    },
  });
  res.json({
    ...user,
    currency: user.currency || "USD",
    language: user.language || "en",
  });
});
