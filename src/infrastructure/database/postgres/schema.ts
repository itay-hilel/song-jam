// src/infrastructure/database/postgres/schema.ts
import { Schema } from 'sequelize';

export const sessionSchema = new Schema({
  id: {
    type: String,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: String,
    allowNull: false,
  },
  participants: {
    type: Array,
    allowNull: true,
  },
  songLines: {
    type: Array,
    allowNull: true,
  },
  status: {
    type: String,
    allowNull: false,
    defaultValue: 'active',
  },
  createdAt: {
    type: Date,
    defaultValue: new Date(),
  },
  updatedAt: {
    type: Date,
    defaultValue: new Date(),
  },
});

export const songLineSchema = new Schema({
  id: {
    type: String,
    primaryKey: true,
    allowNull: false,
  },
  content: {
    type: String,
    allowNull: false,
  },
  sessionId: {
    type: String,
    allowNull: false,
  },
  createdAt: {
    type: Date,
    defaultValue: new Date(),
  },
  updatedAt: {
    type: Date,
    defaultValue: new Date(),
  },
});