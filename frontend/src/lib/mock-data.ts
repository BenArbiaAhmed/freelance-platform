// Shapes mirror backend entities exactly (camelCase kept for TS, same field names)

export type MissionStatut = 'active' | 'draft' | 'closed'
export type CandidatureStatut = 'pending' | 'accepted' | 'rejected'
export type ContratStatut = 'draft' | 'signed' | 'completed' | 'cancelled'

export interface Mission {
  id: string
  titre: string
  description: string
  budget: number
  deadline: string
  statut: MissionStatut
  competencesRequises: string[]
  dateCreation: string
  client: { nom: string; entreprise: string; photo?: string }
  candidatureCount: number
}

export interface FreelanceProfile {
  id: string
  nom: string
  photo: string | null
  bio: string
  tarifJournalier: number
  disponible: boolean
  rating: number
  competences: { nom: string; niveau: string }[]
}

export interface Candidature {
  id: string
  mission: Pick<Mission, 'id' | 'titre' | 'budget' | 'competencesRequises'>
  tarifPropose: number
  statut: CandidatureStatut
  dateCreation: string
}

export interface Contrat {
  id: string
  mission: Pick<Mission, 'titre'>
  client: { nom: string; entreprise: string }
  montant: number
  statut: ContratStatut
  dateCreation: string
}

// ─── Missions ────────────────────────────────────────────────────────────────
export const MISSIONS: Mission[] = [
  {
    id: '1',
    titre: 'Senior React Developer for SaaS Dashboard',
    description: 'We need an experienced React developer to build a complex analytics dashboard with real-time data streaming, custom charts, and responsive design.',
    budget: 4500,
    deadline: '2026-07-15',
    statut: 'active',
    competencesRequises: ['React', 'TypeScript', 'Tailwind CSS', 'REST API'],
    dateCreation: '2026-05-20',
    client: { nom: 'Sophie Laurent', entreprise: 'Nexora', photo: 'https://i.pravatar.cc/40?img=5' },
    candidatureCount: 8,
  },
  {
    id: '2',
    titre: 'NestJS Backend Engineer — Webhook System',
    description: 'Build a robust outbound webhook delivery system with retry logic, signature verification, and log storage using NestJS and TypeORM.',
    budget: 3200,
    deadline: '2026-06-30',
    statut: 'active',
    competencesRequises: ['NestJS', 'TypeORM', 'PostgreSQL', 'Node.js'],
    dateCreation: '2026-05-18',
    client: { nom: 'James Okafor', entreprise: 'Stackly', photo: 'https://i.pravatar.cc/40?img=12' },
    candidatureCount: 5,
  },
  {
    id: '3',
    titre: 'UX/UI Designer for Mobile App Redesign',
    description: 'Complete redesign of our iOS and Android app. We need high-fidelity Figma mockups, design system, and developer handoff assets.',
    budget: 2800,
    deadline: '2026-07-01',
    statut: 'active',
    competencesRequises: ['Figma', 'UI Design', 'UX Research', 'Design System'],
    dateCreation: '2026-05-22',
    client: { nom: 'Maria Chen', entreprise: 'Buildwise', photo: 'https://i.pravatar.cc/40?img=9' },
    candidatureCount: 12,
  },
  {
    id: '4',
    titre: 'GraphQL API Integration Specialist',
    description: 'Integrate our NestJS GraphQL API with an Apollo Client React frontend. Requires experience with subscriptions and optimistic UI.',
    budget: 1800,
    deadline: '2026-06-20',
    statut: 'active',
    competencesRequises: ['GraphQL', 'Apollo Client', 'React', 'NestJS'],
    dateCreation: '2026-05-15',
    client: { nom: 'Rayan Mansouri', entreprise: 'Veritas Tech', photo: 'https://i.pravatar.cc/40?img=15' },
    candidatureCount: 3,
  },
  {
    id: '5',
    titre: 'DevOps Engineer — CI/CD Pipeline Setup',
    description: 'Set up GitHub Actions CI/CD for a NestJS + React monorepo. Docker, staging/production environments, and secrets management required.',
    budget: 2200,
    deadline: '2026-06-25',
    statut: 'active',
    competencesRequises: ['Docker', 'GitHub Actions', 'Linux', 'Nginx'],
    dateCreation: '2026-05-21',
    client: { nom: 'Laura Andersen', entreprise: 'CloudForge', photo: 'https://i.pravatar.cc/40?img=20' },
    candidatureCount: 6,
  },
  {
    id: '6',
    titre: 'Technical Writer — API Documentation',
    description: 'Document a REST + GraphQL + WebSocket API surface. Swagger/OpenAPI experience required. Deliverable: full docs site using Docusaurus.',
    budget: 1200,
    deadline: '2026-07-10',
    statut: 'active',
    competencesRequises: ['Technical Writing', 'OpenAPI', 'Docusaurus', 'Markdown'],
    dateCreation: '2026-05-23',
    client: { nom: 'Thomas Petit', entreprise: 'ApiFirst', photo: 'https://i.pravatar.cc/40?img=8' },
    candidatureCount: 4,
  },
]

// ─── Freelancers ─────────────────────────────────────────────────────────────
export const FREELANCERS: FreelanceProfile[] = [
  {
    id: '1',
    nom: 'Aisha Kamara',
    photo: 'https://i.pravatar.cc/80?img=47',
    bio: 'Full-stack developer with 6 years building SaaS products. Passionate about developer experience and clean APIs.',
    tarifJournalier: 480,
    disponible: true,
    rating: 4.9,
    competences: [
      { nom: 'React', niveau: 'Expert' },
      { nom: 'NestJS', niveau: 'Advanced' },
      { nom: 'TypeScript', niveau: 'Expert' },
      { nom: 'PostgreSQL', niveau: 'Advanced' },
    ],
  },
  {
    id: '2',
    nom: 'Lucas Ferreira',
    photo: 'https://i.pravatar.cc/80?img=33',
    bio: 'Backend specialist focused on distributed systems, event-driven architecture, and high-performance APIs.',
    tarifJournalier: 550,
    disponible: true,
    rating: 4.8,
    competences: [
      { nom: 'NestJS', niveau: 'Expert' },
      { nom: 'TypeORM', niveau: 'Expert' },
      { nom: 'GraphQL', niveau: 'Advanced' },
      { nom: 'Docker', niveau: 'Advanced' },
    ],
  },
  {
    id: '3',
    nom: 'Yuki Tanaka',
    photo: 'https://i.pravatar.cc/80?img=25',
    bio: 'Product designer specialising in complex data-heavy interfaces. Figma expert with a strong engineering background.',
    tarifJournalier: 420,
    disponible: false,
    rating: 4.9,
    competences: [
      { nom: 'Figma', niveau: 'Expert' },
      { nom: 'UI Design', niveau: 'Expert' },
      { nom: 'UX Research', niveau: 'Advanced' },
      { nom: 'Design System', niveau: 'Expert' },
    ],
  },
  {
    id: '4',
    nom: 'Omar Shaikh',
    photo: 'https://i.pravatar.cc/80?img=52',
    bio: 'DevOps and platform engineer. Built CI/CD pipelines for teams from 5 to 200 engineers. AWS + GCP certified.',
    tarifJournalier: 500,
    disponible: true,
    rating: 4.7,
    competences: [
      { nom: 'Docker', niveau: 'Expert' },
      { nom: 'GitHub Actions', niveau: 'Expert' },
      { nom: 'Kubernetes', niveau: 'Advanced' },
      { nom: 'Terraform', niveau: 'Advanced' },
    ],
  },
  {
    id: '5',
    nom: 'Camille Moreau',
    photo: 'https://i.pravatar.cc/80?img=44',
    bio: 'Mobile developer with 5 years of React Native experience. Delivered 12+ apps to the App Store and Play Store.',
    tarifJournalier: 460,
    disponible: true,
    rating: 4.8,
    competences: [
      { nom: 'React Native', niveau: 'Expert' },
      { nom: 'TypeScript', niveau: 'Expert' },
      { nom: 'Expo', niveau: 'Advanced' },
      { nom: 'Firebase', niveau: 'Advanced' },
    ],
  },
  {
    id: '6',
    nom: 'David Osei',
    photo: 'https://i.pravatar.cc/80?img=57',
    bio: 'Data engineer and technical writer. Specialises in clear documentation for complex APIs and event-driven systems.',
    tarifJournalier: 320,
    disponible: true,
    rating: 4.6,
    competences: [
      { nom: 'Technical Writing', niveau: 'Expert' },
      { nom: 'OpenAPI', niveau: 'Expert' },
      { nom: 'Python', niveau: 'Advanced' },
      { nom: 'Docusaurus', niveau: 'Advanced' },
    ],
  },
]

// ─── My candidatures (freelance POV) ─────────────────────────────────────────
export const MY_CANDIDATURES: Candidature[] = [
  {
    id: 'c1',
    mission: { id: '1', titre: 'Senior React Developer for SaaS Dashboard', budget: 4500, competencesRequises: ['React', 'TypeScript'] },
    tarifPropose: 4200,
    statut: 'pending',
    dateCreation: '2026-05-24',
  },
  {
    id: 'c2',
    mission: { id: '3', titre: 'UX/UI Designer for Mobile App Redesign', budget: 2800, competencesRequises: ['Figma', 'UI Design'] },
    tarifPropose: 2600,
    statut: 'accepted',
    dateCreation: '2026-05-19',
  },
  {
    id: 'c3',
    mission: { id: '5', titre: 'DevOps Engineer — CI/CD Pipeline Setup', budget: 2200, competencesRequises: ['Docker', 'GitHub Actions'] },
    tarifPropose: 2000,
    statut: 'rejected',
    dateCreation: '2026-05-16',
  },
]

// ─── Active contracts (freelance POV) ────────────────────────────────────────
export const MY_CONTRATS: Contrat[] = [
  {
    id: 'k1',
    mission: { titre: 'UX/UI Designer for Mobile App Redesign' },
    client: { nom: 'Maria Chen', entreprise: 'Buildwise' },
    montant: 2600,
    statut: 'signed',
    dateCreation: '2026-05-20',
  },
  {
    id: 'k2',
    mission: { titre: 'GraphQL API Integration Specialist' },
    client: { nom: 'Rayan Mansouri', entreprise: 'Veritas Tech' },
    montant: 1750,
    statut: 'completed',
    dateCreation: '2026-04-10',
  },
]
