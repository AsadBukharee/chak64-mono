const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, CheckCircle2, FileJson, Terminal } from "lucide-react";

const COLLECTION = {
  info: {
    name: "My64 Village Connect — Full API Collection",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    description: "Complete API reference for My64 Village Connect app. Base URL: https://api.db.com/v1/apps/{{APP_ID}}"
  },
  variable: [
    { key: "BASE_URL", value: "https://api.db.com/v1/apps/{{APP_ID}}", type: "string" },
    { key: "TOKEN", value: "your-jwt-token-here", type: "string" },
    { key: "APP_ID", value: "your-app-id-here", type: "string" }
  ],
  item: [
    {
      name: "🔐 Auth",
      item: [
        { name: "Get Current User", request: { method: "GET", url: "{{BASE_URL}}/auth/me", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Update Profile", request: { method: "PATCH", url: "{{BASE_URL}}/auth/me", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ full_name: "Ahmad Ali", bio: "Village member", phone: "03001234567", location: "Village 64, Punjab" }) } } },
        { name: "Logout", request: { method: "POST", url: "{{BASE_URL}}/auth/logout", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Invite User", request: { method: "POST", url: "{{BASE_URL}}/auth/invite", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ email: "newmember@example.com", role: "user" }) } } },
      ]
    },
    {
      name: "👥 Teams",
      item: [
        { name: "List All Teams", request: { method: "GET", url: "{{BASE_URL}}/entities/Team?sort=-created_date", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Get Team by ID", request: { method: "GET", url: "{{BASE_URL}}/entities/Team/{{team_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Create Team", request: { method: "POST", url: "{{BASE_URL}}/entities/Team", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ name: "Helping Hands", description: "Collects Zakat and supports needy", team_type: "zakat_collection", status: "active", created_by_name: "Admin" }) } } },
        { name: "Update Team", request: { method: "PATCH", url: "{{BASE_URL}}/entities/Team/{{team_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ status: "inactive" }) } } },
        { name: "Delete Team", request: { method: "DELETE", url: "{{BASE_URL}}/entities/Team/{{team_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Filter Active Teams", request: { method: "GET", url: "{{BASE_URL}}/entities/Team?status=active", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
      ]
    },
    {
      name: "👤 Team Members",
      item: [
        { name: "List Team Members", request: { method: "GET", url: "{{BASE_URL}}/entities/TeamMember?team_id={{team_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Add Team Member", request: { method: "POST", url: "{{BASE_URL}}/entities/TeamMember", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ team_id: "{{team_id}}", member_name: "Hassan Ahmed", member_email: "hassan@example.com", role: "member", joined_date: "2024-01-15" }) } } },
        { name: "Remove Member", request: { method: "DELETE", url: "{{BASE_URL}}/entities/TeamMember/{{member_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Update Member Role", request: { method: "PATCH", url: "{{BASE_URL}}/entities/TeamMember/{{member_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ role: "leader" }) } } },
      ]
    },
    {
      name: "🤲 Zakat Collection",
      item: [
        { name: "List Zakat by Team", request: { method: "GET", url: "{{BASE_URL}}/entities/ZakatCollection?team_id={{team_id}}&sort=-created_date", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Add Zakat Entry", request: { method: "POST", url: "{{BASE_URL}}/entities/ZakatCollection", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ team_id: "{{team_id}}", collector_name: "Bilal Khan", collector_email: "bilal@example.com", donor_name: "Muhammad Aslam", donor_address: "House 12, Block B", amount: 5000, collection_date: "2024-01-15", status: "collected", notes: "" }) } } },
        { name: "Update Zakat Status", request: { method: "PATCH", url: "{{BASE_URL}}/entities/ZakatCollection/{{zakat_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ status: "distributed" }) } } },
        { name: "Delete Zakat Entry", request: { method: "DELETE", url: "{{BASE_URL}}/entities/ZakatCollection/{{zakat_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
      ]
    },
    {
      name: "🏠 Needy Persons",
      item: [
        { name: "List Needy by Team", request: { method: "GET", url: "{{BASE_URL}}/entities/NeedyPerson?team_id={{team_id}}&sort=-created_date", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Add Needy Person", request: { method: "POST", url: "{{BASE_URL}}/entities/NeedyPerson", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ team_id: "{{team_id}}", full_name: "Fatima Bibi", address: "House 45, Mohalla", contact_number: "03009876543", family_size: 6, need_type: "food", monthly_income: 8000, description: "Widow with 5 children, no fixed income", priority: "high", status: "active", added_by: "collector@example.com", added_by_name: "Collector Name" }) } } },
        { name: "Update Needy Status", request: { method: "PATCH", url: "{{BASE_URL}}/entities/NeedyPerson/{{person_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ status: "assisted" }) } } },
        { name: "Filter High Priority", request: { method: "GET", url: "{{BASE_URL}}/entities/NeedyPerson?priority=high&status=active", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Delete Needy Record", request: { method: "DELETE", url: "{{BASE_URL}}/entities/NeedyPerson/{{person_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
      ]
    },
    {
      name: "📋 Surveys",
      item: [
        { name: "List Surveys by Team", request: { method: "GET", url: "{{BASE_URL}}/entities/Survey?team_id={{team_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Create Survey", request: { method: "POST", url: "{{BASE_URL}}/entities/Survey", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ team_id: "{{team_id}}", title: "Household Needs Survey 2024", description: "Annual household survey", survey_type: "household", status: "draft", created_by: "admin@example.com", created_by_name: "Admin" }) } } },
        { name: "Activate Survey", request: { method: "PATCH", url: "{{BASE_URL}}/entities/Survey/{{survey_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ status: "active" }) } } },
        { name: "Complete Survey", request: { method: "PATCH", url: "{{BASE_URL}}/entities/Survey/{{survey_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ status: "completed" }) } } },
        { name: "Submit Survey Response", request: { method: "POST", url: "{{BASE_URL}}/entities/SurveyResponse", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ survey_id: "{{survey_id}}", team_id: "{{team_id}}", respondent_name: "Ali Hassan", respondent_address: "House 7, Gali 3", answers: [{ question: "How many family members?", answer: "5" }, { question: "Access to clean water?", answer: "No" }], submitted_by: "member@example.com", submitted_by_name: "Team Member", notes: "Family in urgent need" }) } } },
        { name: "List Survey Responses", request: { method: "GET", url: "{{BASE_URL}}/entities/SurveyResponse?survey_id={{survey_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
      ]
    },
    {
      name: "💰 Donations",
      item: [
        { name: "List All Donations", request: { method: "GET", url: "{{BASE_URL}}/entities/Donation?sort=-created_date", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Create Donation (Charity)", request: { method: "POST", url: "{{BASE_URL}}/entities/Donation", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ donor_name: "Usman Ali", donor_email: "usman@example.com", amount: 10000, donation_type: "charity", charity_type: "zakat", is_public: true, location: "Lahore" }) } } },
        { name: "Create Donation (Sponsor Fund)", request: { method: "POST", url: "{{BASE_URL}}/entities/Donation", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ donor_name: "Sara Khan", donor_email: "sara@example.com", amount: 25000, donation_type: "sponsor_fund", fund_type: "Education", is_public: false, location: "Karachi" }) } } },
        { name: "Filter Sponsor Fund Donations", request: { method: "GET", url: "{{BASE_URL}}/entities/Donation?donation_type=sponsor_fund", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Delete Donation", request: { method: "DELETE", url: "{{BASE_URL}}/entities/Donation/{{donation_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
      ]
    },
    {
      name: "🏆 Fund Types",
      item: [
        { name: "List Fund Types", request: { method: "GET", url: "{{BASE_URL}}/entities/FundType", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Create Fund Type", request: { method: "POST", url: "{{BASE_URL}}/entities/FundType", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ name: "Village Development", description: "Street lights, roads, and infrastructure" }) } } },
        { name: "Update Fund Type", request: { method: "PATCH", url: "{{BASE_URL}}/entities/FundType/{{fund_type_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ description: "Updated description" }) } } },
        { name: "Delete Fund Type", request: { method: "DELETE", url: "{{BASE_URL}}/entities/FundType/{{fund_type_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
      ]
    },
    {
      name: "📣 Campaigns",
      item: [
        { name: "List Campaigns", request: { method: "GET", url: "{{BASE_URL}}/entities/Campaign?sort=-created_date", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Create Campaign", request: { method: "POST", url: "{{BASE_URL}}/entities/Campaign", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ title: "Build Village School", description: "Fund to build a new primary school", goal_amount: 500000, raised_amount: 0, status: "active", end_date: "2024-12-31" }) } } },
        { name: "Update Campaign", request: { method: "PATCH", url: "{{BASE_URL}}/entities/Campaign/{{campaign_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ raised_amount: 150000 }) } } },
        { name: "Delete Campaign", request: { method: "DELETE", url: "{{BASE_URL}}/entities/Campaign/{{campaign_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
      ]
    },
    {
      name: "🗳️ Polls",
      item: [
        { name: "List Polls", request: { method: "GET", url: "{{BASE_URL}}/entities/Poll?sort=-created_date", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Create Poll", request: { method: "POST", url: "{{BASE_URL}}/entities/Poll", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ question: "Should we build a new water well?", options: ["Yes", "No", "Need more discussion"], status: "active" }) } } },
        { name: "Update Poll Votes", request: { method: "PATCH", url: "{{BASE_URL}}/entities/Poll/{{poll_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ votes: { "Yes": 45, "No": 12 } }) } } },
        { name: "Close Poll", request: { method: "PATCH", url: "{{BASE_URL}}/entities/Poll/{{poll_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ status: "closed" }) } } },
      ]
    },
    {
      name: "📰 Feed Posts",
      item: [
        { name: "List Posts", request: { method: "GET", url: "{{BASE_URL}}/entities/Post?sort=-created_date&limit=20", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
        { name: "Create Post", request: { method: "POST", url: "{{BASE_URL}}/entities/Post", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ content: "Village meeting tomorrow at 5pm", post_type: "announcement", author_name: "Admin", likes: 0 }) } } },
        { name: "Like Post", request: { method: "PATCH", url: "{{BASE_URL}}/entities/Post/{{post_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ likes: 5 }) } } },
        { name: "Delete Post", request: { method: "DELETE", url: "{{BASE_URL}}/entities/Post/{{post_id}}", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }] } },
      ]
    },
    {
      name: "📁 File Upload",
      item: [
        { name: "Upload Public File", request: { method: "POST", url: "{{BASE_URL}}/integrations/Core/UploadFile", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }], body: { mode: "formdata", formdata: [{ key: "file", type: "file", src: "" }] } } },
        { name: "Upload Private File", request: { method: "POST", url: "{{BASE_URL}}/integrations/Core/UploadPrivateFile", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }], body: { mode: "formdata", formdata: [{ key: "file", type: "file", src: "" }] } } },
        { name: "Create Signed URL", request: { method: "POST", url: "{{BASE_URL}}/integrations/Core/CreateFileSignedUrl", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ file_uri: "private://path/to/file", expires_in: 300 }) } } },
      ]
    },
    {
      name: "🤖 AI Integrations",
      item: [
        { name: "Invoke LLM", request: { method: "POST", url: "{{BASE_URL}}/integrations/Core/InvokeLLM", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ prompt: "Summarize the village needs for this month", add_context_from_internet: false }) } } },
        { name: "Send Email", request: { method: "POST", url: "{{BASE_URL}}/integrations/Core/SendEmail", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ to: "admin@example.com", subject: "New Donation Received", body: "A new donation of PKR 5000 has been received." }) } } },
        { name: "Generate Image", request: { method: "POST", url: "{{BASE_URL}}/integrations/Core/GenerateImage", header: [{ key: "Authorization", value: "Bearer {{TOKEN}}" }, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ prompt: "A beautiful Pakistani village mosque at sunset" }) } } },
      ]
    },
  ]
};

export default function PostmanCollection() {
  const [copied, setCopied] = useState(false);

  const jsonStr = JSON.stringify(COLLECTION, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "My64-VillageConnect-Postman-Collection.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 rounded-2xl p-8 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
              <FileJson className="w-7 h-7 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Postman Collection</h1>
              <p className="text-gray-400 text-sm">My64 Village Connect — Complete API Reference</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-5">
            This collection contains all API endpoints for the My64 Village Connect application, grouped by module.
            Import into Postman and set your <code className="bg-white/10 px-1 rounded">APP_ID</code> and <code className="bg-white/10 px-1 rounded">TOKEN</code> variables.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDownload} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Download className="w-4 h-4" /> Download JSON
            </Button>
            <Button onClick={handleCopy} variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
          </div>
        </div>

        {/* Setup Instructions */}
        <Card className="p-5 mb-6 border border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <Terminal className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800 mb-2">How to Import</h3>
              <ol className="text-sm text-amber-700 space-y-1 list-decimal ml-4">
                <li>Click "Download JSON" above to save the collection file</li>
                <li>Open Postman → Click "Import" → Select the downloaded file</li>
                <li>Set Collection Variables: <code className="bg-amber-100 px-1 rounded">APP_ID</code> = your Base44 app ID</li>
                <li>Set <code className="bg-amber-100 px-1 rounded">TOKEN</code> = your JWT auth token (get from browser cookies)</li>
                <li>Start testing! All requests are pre-configured with auth headers</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Collection Preview */}
        {COLLECTION.item.map((folder) => (
          <Card key={folder.name} className="mb-4 border border-gray-200 overflow-hidden">
            <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
              <span className="text-white font-semibold text-sm">{folder.name}</span>
              <Badge className="bg-gray-600 text-gray-200 border-0 text-xs">{folder.item.length} requests</Badge>
            </div>
            <div className="divide-y divide-gray-100">
              {folder.item.map((req, i) => {
                const methodColors = {
                  GET: "bg-green-100 text-green-700",
                  POST: "bg-blue-100 text-blue-700",
                  PATCH: "bg-yellow-100 text-yellow-700",
                  DELETE: "bg-red-100 text-red-700",
                  PUT: "bg-purple-100 text-purple-700"
                };
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                    <Badge className={`${methodColors[req.request.method]} border-0 font-mono text-xs min-w-14 justify-center`}>
                      {req.request.method}
                    </Badge>
                    <code className="text-xs text-gray-500 flex-1 truncate">{req.request.url}</code>
                    <span className="text-xs text-gray-700 font-medium hidden md:block">{req.name}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {/* Raw JSON Preview */}
        <Card className="border border-gray-200 overflow-hidden">
          <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
            <span className="text-gray-300 text-sm font-mono">collection.json</span>
            <Button size="sm" variant="ghost" onClick={handleCopy} className="text-gray-400 hover:text-white">
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <pre className="bg-gray-950 text-green-400 p-4 text-xs overflow-x-auto max-h-80 overflow-y-auto">
            <code>{jsonStr}</code>
          </pre>
        </Card>
      </div>
    </div>
  );
}