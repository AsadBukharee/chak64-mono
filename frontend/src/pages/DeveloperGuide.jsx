const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Database, Shield, Layers, GitBranch, Zap, Users, BookOpen, ChevronDown, ChevronRight } from "lucide-react";

const Section = ({ title, icon: SectionIcon, color, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <Card className="mb-4 border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 ${color} text-white`}
      >
        <div className="flex items-center gap-3">
          <SectionIcon className="w-5 h-5" />
          <span className="font-bold text-lg">{title}</span>
        </div>
        {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </Card>
  );
};

const CodeBlock = ({ code }) => (
  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto mt-2 mb-3">
    <code>{code}</code>
  </pre>
);

const EntityCard = ({ name, fields, description }) => (
  <div className="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50">
    <div className="flex items-center gap-2 mb-2">
      <Badge className="bg-blue-100 text-blue-700 border-0 font-mono">{name}</Badge>
      <span className="text-xs text-gray-500">{description}</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
      {fields.map((f, i) => (
        <div key={i} className="text-xs font-mono text-gray-600">
          <span className="text-purple-600">{f.name}</span>
          <span className="text-gray-400">: {f.type}</span>
          {f.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      ))}
    </div>
  </div>
);

const ApiRow = ({ method, path, desc }) => {
  const colors = { GET: "bg-green-100 text-green-700", POST: "bg-blue-100 text-blue-700", PUT: "bg-yellow-100 text-yellow-700", DELETE: "bg-red-100 text-red-700", PATCH: "bg-orange-100 text-orange-700" };
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100">
      <Badge className={`${colors[method] || "bg-gray-100 text-gray-700"} border-0 font-mono text-xs min-w-16 justify-center`}>{method}</Badge>
      <code className="text-xs text-gray-700 font-mono flex-1">{path}</code>
      <span className="text-xs text-gray-500 min-w-40">{desc}</span>
    </div>
  );
};

export default function DeveloperGuide() {
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-3xl font-bold">My64 Village Connect</h1>
              <p className="text-gray-400">Developer Guide — Backend Architecture & API Reference</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">v2.0</Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">Base44 Platform</Badge>
            <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">React + Tailwind</Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">NoSQL Entities</Badge>
          </div>
          <p className="text-gray-300 text-sm mt-4 leading-relaxed">
            This guide covers the full technical architecture of the My64 Village Connect application — a platform for Pakistani village communities
            to manage social welfare, donations, teams, polls, live streams, campaigns, and more.
          </p>
        </div>

        {/* Architecture Overview */}
        <Section title="Architecture Overview" icon={Layers} color="bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-2">Frontend</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• React 18 + Vite</li>
                <li>• Tailwind CSS + shadcn/ui</li>
                <li>• React Router v6 (SPA routing)</li>
                <li>• TanStack React Query (data fetching)</li>
                <li>• Framer Motion (animations)</li>
                <li>• Lucide React (icons)</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-green-800 mb-2">Backend (Base44 BaaS)</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Entity-based NoSQL database</li>
                <li>• Built-in Auth (JWT, role-based)</li>
                <li>• File upload / storage</li>
                <li>• LLM integration (AI Help Chat)</li>
                <li>• Email integration (Resend)</li>
                <li>• Real-time subscriptions</li>
              </ul>
            </div>
          </div>
          <h4 className="font-semibold text-gray-700 mb-2">Request Flow</h4>
          <CodeBlock code={`Browser
  └── React SPA (Vite)
        └── base44Client SDK
              └── Base44 API (HTTPS REST)
                    ├── Auth Service  (JWT tokens)
                    ├── Entity Service (CRUD NoSQL)
                    ├── File Service  (S3-backed storage)
                    └── Integration Service (LLM, Email, etc.)`} />
        </Section>

        {/* Authentication */}
        <Section title="Authentication & Authorization" icon={Shield} color="bg-gradient-to-r from-indigo-600 to-purple-700">
          <p className="text-sm text-gray-600 mb-3">
            Auth is handled entirely by the Base44 platform. The app uses JWT-based session tokens stored in browser cookies/localStorage.
          </p>
          <h4 className="font-semibold text-gray-700 mb-2">Roles</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-red-100 text-red-700 border-0">admin — Full control</Badge>
            <Badge className="bg-blue-100 text-blue-700 border-0">user — Standard villager</Badge>
          </div>
          <h4 className="font-semibold text-gray-700 mb-2">Auth SDK Methods</h4>
          <CodeBlock code={`import { base44 } from '@/api/base44Client';

// Get current user
const user = await db.auth.me();
// { id, email, full_name, role, profile_image_url, ... }

// Update current user profile
await db.auth.updateMe({ bio: "...", profile_image_url: "..." });

// Logout
db.auth.logout();

// Redirect to login
db.auth.redirectToLogin('/target-page');

// Check auth
const isAuth = await db.auth.isAuthenticated(); // boolean`} />
          <h4 className="font-semibold text-gray-700 mt-4 mb-2">Admin-gated Operations</h4>
          <p className="text-sm text-gray-600">
            The following actions require <code className="bg-gray-100 px-1 rounded">role === "admin"</code> check in frontend:
          </p>
          <ul className="text-sm text-gray-600 list-disc ml-5 mt-2 space-y-1">
            <li>Create / edit / delete Teams</li>
            <li>Activate / complete Surveys</li>
            <li>Manage Users (AdminUsers page)</li>
            <li>Manage Campaigns, Polls, Ads, Donations</li>
            <li>Access all <code className="bg-gray-100 px-1 rounded">/Admin*</code> pages</li>
          </ul>
        </Section>

        {/* Entities */}
        <Section title="Data Entities (Database Schema)" icon={Database} color="bg-gradient-to-r from-teal-600 to-emerald-700">
          <p className="text-sm text-gray-600 mb-4">
            All entities have built-in fields: <code className="bg-gray-100 px-1 rounded">id</code>, <code className="bg-gray-100 px-1 rounded">created_date</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">updated_date</code>, <code className="bg-gray-100 px-1 rounded">created_by</code> (email of creator).
            <span className="text-red-500 ml-2">* = required</span>
          </p>

          <EntityCard name="User" description="Built-in entity — village members"
            fields={[
              { name: "email", type: "string", required: true }, { name: "full_name", type: "string" },
              { name: "role", type: "enum: admin|user", required: true }, { name: "profile_image_url", type: "string" },
              { name: "bio", type: "string" }, { name: "phone", type: "string" },
              { name: "location", type: "string" }, { name: "has_selected_language", type: "boolean" },
            ]} />

          <EntityCard name="Team" description="Village volunteer teams created by admin"
            fields={[
              { name: "name", type: "string", required: true }, { name: "description", type: "string" },
              { name: "team_type", type: "enum: zakat_collection|needy_support|survey|general", required: true },
              { name: "status", type: "enum: active|inactive" }, { name: "created_by_name", type: "string" },
              { name: "member_emails", type: "array<string>" }, { name: "cover_image_url", type: "string" },
            ]} />

          <EntityCard name="TeamMember" description="Members belonging to a team"
            fields={[
              { name: "team_id", type: "string (ref Team)", required: true },
              { name: "member_email", type: "string", required: true }, { name: "member_name", type: "string", required: true },
              { name: "role", type: "enum: leader|member" }, { name: "joined_date", type: "date" },
            ]} />

          <EntityCard name="ZakatCollection" description="Zakat collected by a team"
            fields={[
              { name: "team_id", type: "string (ref Team)", required: true },
              { name: "collector_name", type: "string", required: true }, { name: "collector_email", type: "string" },
              { name: "donor_name", type: "string", required: true }, { name: "donor_address", type: "string" },
              { name: "amount", type: "number", required: true }, { name: "collection_date", type: "date" },
              { name: "status", type: "enum: collected|pending|distributed" }, { name: "notes", type: "string" },
            ]} />

          <EntityCard name="NeedyPerson" description="Registry of needy village residents"
            fields={[
              { name: "team_id", type: "string (ref Team)", required: true }, { name: "full_name", type: "string", required: true },
              { name: "address", type: "string" }, { name: "contact_number", type: "string" },
              { name: "family_size", type: "number" }, { name: "need_type", type: "enum: food|medical|education|financial|housing|other", required: true },
              { name: "monthly_income", type: "number" }, { name: "description", type: "string" },
              { name: "priority", type: "enum: high|medium|low" }, { name: "status", type: "enum: active|assisted|resolved" },
              { name: "added_by", type: "string (email)" }, { name: "added_by_name", type: "string" },
            ]} />

          <EntityCard name="Survey" description="Survey created by a team"
            fields={[
              { name: "team_id", type: "string (ref Team)", required: true }, { name: "title", type: "string", required: true },
              { name: "description", type: "string" }, { name: "survey_type", type: "enum: household|infrastructure|health|education|general" },
              { name: "status", type: "enum: draft|active|completed" },
              { name: "questions", type: "array<{question, type, options}>" },
              { name: "created_by", type: "string (email)" }, { name: "created_by_name", type: "string" },
            ]} />

          <EntityCard name="SurveyResponse" description="Individual survey response per household"
            fields={[
              { name: "survey_id", type: "string (ref Survey)", required: true }, { name: "team_id", type: "string (ref Team)", required: true },
              { name: "respondent_name", type: "string", required: true }, { name: "respondent_address", type: "string" },
              { name: "answers", type: "array<{question, answer}>" }, { name: "submitted_by", type: "string (email)" },
              { name: "submitted_by_name", type: "string" }, { name: "notes", type: "string" },
            ]} />

          <EntityCard name="Donation" description="All types of monetary donations"
            fields={[
              { name: "donor_name", type: "string", required: true }, { name: "donor_email", type: "string", required: true },
              { name: "amount", type: "number", required: true }, { name: "donation_type", type: "enum: charity|sponsor_fund|campaign", required: true },
              { name: "fund_type", type: "string (for sponsor_fund)" }, { name: "charity_type", type: "string" },
              { name: "campaign_id", type: "string (ref Campaign)" }, { name: "is_public", type: "boolean" },
              { name: "location", type: "string" }, { name: "account_number", type: "string" },
              { name: "transaction_screenshot", type: "string (url)" },
            ]} />

          <EntityCard name="FundType" description="Sponsor fund categories"
            fields={[
              { name: "name", type: "string", required: true }, { name: "description", type: "string" },
            ]} />

          <EntityCard name="Campaign" description="Village fundraising campaigns"
            fields={[
              { name: "title", type: "string", required: true }, { name: "description", type: "string" },
              { name: "goal_amount", type: "number" }, { name: "raised_amount", type: "number" },
              { name: "image_url", type: "string" }, { name: "status", type: "enum: active|completed|cancelled" },
              { name: "end_date", type: "date" },
            ]} />

          <EntityCard name="Poll" description="Community polls"
            fields={[
              { name: "question", type: "string", required: true }, { name: "options", type: "array<string>" },
              { name: "votes", type: "object" }, { name: "status", type: "enum: active|closed" },
              { name: "end_date", type: "date" },
            ]} />

          <EntityCard name="Post" description="Community feed posts"
            fields={[
              { name: "content", type: "string", required: true }, { name: "media_url", type: "string" },
              { name: "author_name", type: "string" }, { name: "likes", type: "number" },
              { name: "post_type", type: "enum: general|announcement|event" },
            ]} />

          <EntityCard name="Ad" description="Village announcements/ads"
            fields={[
              { name: "title", type: "string", required: true }, { name: "content", type: "string" },
              { name: "image_url", type: "string" }, { name: "link_url", type: "string" },
              { name: "status", type: "enum: active|inactive" }, { name: "ad_type", type: "string" },
            ]} />
        </Section>

        {/* API Reference */}
        <Section title="API Reference (Entity CRUD)" icon={GitBranch} color="bg-gradient-to-r from-blue-600 to-blue-800">
          <p className="text-sm text-gray-600 mb-3">
            All entity APIs follow RESTful patterns on the Base44 platform. Base URL: <code className="bg-gray-100 px-1 rounded">https://api.db.com/v1/apps/&#123;APP_ID&#125;</code>
          </p>
          <h4 className="font-semibold text-gray-700 mb-2">Standard Entity Operations</h4>
          <ApiRow method="GET" path="/entities/{EntityName}" desc="List all records (supports sort, limit, skip)" />
          <ApiRow method="GET" path="/entities/{EntityName}?field=value" desc="Filter records by field" />
          <ApiRow method="GET" path="/entities/{EntityName}/{id}" desc="Get single record by ID" />
          <ApiRow method="POST" path="/entities/{EntityName}" desc="Create a new record" />
          <ApiRow method="PUT" path="/entities/{EntityName}/{id}" desc="Full update (replace) a record" />
          <ApiRow method="PATCH" path="/entities/{EntityName}/{id}" desc="Partial update a record" />
          <ApiRow method="DELETE" path="/entities/{EntityName}/{id}" desc="Delete a record" />
          <ApiRow method="POST" path="/entities/{EntityName}/bulk" desc="Bulk create multiple records" />

          <h4 className="font-semibold text-gray-700 mt-5 mb-2">Auth Endpoints</h4>
          <ApiRow method="GET" path="/auth/me" desc="Get current authenticated user" />
          <ApiRow method="PATCH" path="/auth/me" desc="Update current user profile" />
          <ApiRow method="POST" path="/auth/logout" desc="Logout current user" />
          <ApiRow method="POST" path="/auth/invite" desc="Invite a new user by email (admin only)" />

          <h4 className="font-semibold text-gray-700 mt-5 mb-2">File Endpoints</h4>
          <ApiRow method="POST" path="/integrations/Core/UploadFile" desc="Upload a public file, returns {file_url}" />
          <ApiRow method="POST" path="/integrations/Core/UploadPrivateFile" desc="Upload private file, returns {file_uri}" />
          <ApiRow method="POST" path="/integrations/Core/CreateFileSignedUrl" desc="Create temp signed URL for private file" />

          <h4 className="font-semibold text-gray-700 mt-5 mb-2">AI / Integration Endpoints</h4>
          <ApiRow method="POST" path="/integrations/Core/InvokeLLM" desc="Call LLM with prompt, returns AI response" />
          <ApiRow method="POST" path="/integrations/Core/SendEmail" desc="Send email via Resend" />
          <ApiRow method="POST" path="/integrations/Core/GenerateImage" desc="Generate image with AI" />
        </Section>

        {/* SDK Usage */}
        <Section title="Frontend SDK Usage" icon={Code2} color="bg-gradient-to-r from-violet-600 to-fuchsia-700">
          <CodeBlock code={`import { base44 } from '@/api/base44Client';

// ── Entity CRUD ──────────────────────────────────────────
await db.entities.Team.list('-created_date', 20);
await db.entities.Team.filter({ status: 'active' }, '-created_date', 50);
await db.entities.Team.create({ name: 'Helping Hands', team_type: 'zakat_collection' });
await db.entities.Team.update(id, { status: 'inactive' });
await db.entities.Team.delete(id);
await db.entities.Team.bulkCreate([{ name: 'A' }, { name: 'B' }]);

// ── Real-time Subscription ────────────────────────────────
const unsubscribe = db.entities.Team.subscribe((event) => {
  // event.type: 'create' | 'update' | 'delete'
  // event.id: record id
  // event.data: full record object
});
// call unsubscribe() on component unmount

// ── File Upload ───────────────────────────────────────────
const { file_url } = await db.integrations.Core.UploadFile({ file: fileObject });

// ── LLM Call ─────────────────────────────────────────────
const response = await db.integrations.Core.InvokeLLM({
  prompt: 'Summarize village needs',
  response_json_schema: { type: 'object', properties: { summary: { type: 'string' } } }
});

// ── Invite User ───────────────────────────────────────────
await db.users.inviteUser('villager@example.com', 'user');`} />
        </Section>

        {/* Features Overview */}
        <Section title="Feature Modules" icon={Users} color="bg-gradient-to-r from-rose-600 to-pink-700">
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { name: "Feed", desc: "Community posts, announcements, and social updates", route: "/" },
              { name: "Teams", desc: "Volunteer teams for Zakat, Needy persons, and Surveys", route: "/Teams" },
              { name: "Polls", desc: "Community voting on village matters", route: "/Polls" },
              { name: "Campaigns", desc: "Village fundraising campaigns with progress tracking", route: "/Campaigns" },
              { name: "Donate", desc: "Direct charity donations (Zakat, Medical, etc.)", route: "/Donate" },
              { name: "SponsorFund", desc: "8 fund types: Education, Water, Masjid, Health, etc.", route: "/SponsorFund" },
              { name: "Live", desc: "Live streaming integration for village events", route: "/Live" },
              { name: "About", desc: "Village information, leadership, and contact details", route: "/About" },
              { name: "Profile", desc: "User profile management with image upload", route: "/Profile" },
              { name: "AdminDashboard", desc: "Stats overview: donations, members, campaigns", route: "/AdminDashboard" },
              { name: "AdminUsers", desc: "Manage all village members and their roles", route: "/AdminUsers" },
              { name: "AdminAds", desc: "Village advertisements and announcements", route: "/AdminAds" },
            ].map((f) => (
              <div key={f.name} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-rose-100 text-rose-700 border-0 font-mono text-xs">{f.name}</Badge>
                  <code className="text-xs text-gray-400">{f.route}</code>
                </div>
                <p className="text-xs text-gray-600 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* SponsorFund Types */}
        <Section title="Sponsor Fund Types" icon={Zap} color="bg-gradient-to-r from-orange-500 to-amber-600">
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { name: "Education", desc: "School fees, books, scholarships for village children" },
              { name: "Water Filter", desc: "Clean water access, water filter installations" },
              { name: "Imam Masjid Fund", desc: "Imam salary and mosque religious services" },
              { name: "Masjid Fund", desc: "Mosque construction, maintenance and renovation" },
              { name: "Home Building", desc: "Support for homeless or flood-affected families" },
              { name: "Health", desc: "Medical treatment, medicine, hospital support" },
              { name: "Girls Marriage", desc: "Financial support for underprivileged brides" },
              { name: "Village Development", desc: "Street lights, road maintenance, infrastructure" },
            ].map((f) => (
              <div key={f.name} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="font-semibold text-orange-800 text-sm">{f.name}</p>
                <p className="text-xs text-orange-600 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 py-8">
          My64 Village Connect — Developer Guide · Built on Base44 Platform · For internal use by backend developers
        </div>
      </div>
    </div>
  );
}