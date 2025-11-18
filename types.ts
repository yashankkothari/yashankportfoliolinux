
import React from 'react';

export enum TerminalMode {
  STANDARD = 'STANDARD',
  CHAT = 'CHAT',
  IMAGE_EDIT = 'IMAGE_EDIT',
  VIM = 'VIM',
  GAME = 'GAME'
}

export enum ViewMode {
  TERMINAL = 'TERMINAL',
  GUI = 'GUI'
}

export interface Command {
  command: string;
  description: string;
  action?: () => void;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'component';
  content: React.ReactNode;
  promptLabel?: string;
}

export interface Project {
  name: string;
  tech: string;
  description: string[];
  year: string;
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  details: string[];
}

export interface Education {
  institution: string;
  degree: string;
  location: string;
  period: string;
}

export interface ResumeData {
  name: string;
  contact: {
    phone: string;
    email: string;
    linkedin: string;
    github: string;
  };
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: { name: string; year: string }[];
  skills: {
    languages: string;
    frameworks: string;
    tools: string;
    libraries: string;
  };
}

export type ThemeName = 'standard' | 'retro' | 'ubuntu' | 'dracula' | 'cyberpunk' | 'forest' | 'ocean';

export interface ThemeColors {
  background: string;
  text: string;
  prompt: string;
  accent: string;
}
