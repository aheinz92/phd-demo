import { pgTable, text, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const interpretations = pgTable("interpretations", {
  id: serial("id").primaryKey(),
  artistName: text("artist_name").notNull(),
  recordingYear: integer("recording_year").notNull(),
  colorCode: text("color_code").notNull(),
  albumArt: text("album_art"),
  audioSnippet: text("audio_snippet"),
});

export const varianceData = pgTable("variance_data", {
  id: serial("id").primaryKey(),
  interpretationId: integer("interpretation_id").references(() => interpretations.id),
  timePosition: real("time_position").notNull(), // 0-100 percentage
  varianceValue: real("variance_value").notNull(), // Height from baseline
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertInterpretationSchema = createInsertSchema(interpretations).omit({
  id: true,
});

export const insertVarianceDataSchema = createInsertSchema(varianceData).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Interpretation = typeof interpretations.$inferSelect;
export type VarianceData = typeof varianceData.$inferSelect;
export type InsertInterpretation = z.infer<typeof insertInterpretationSchema>;
export type InsertVarianceData = z.infer<typeof insertVarianceDataSchema>;
