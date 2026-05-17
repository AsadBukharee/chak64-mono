const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Loader2, FileText, User, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const DEFAULT_QUESTIONS = [
  "How many family members?",
  "Do you have access to clean water?",
  "Is there a school-age child in the family?",
  "Any health issues requiring attention?",
  "Monthly household income (PKR)?",
  "Main livelihood source?",
];

export default function SurveyResponseDialog({ survey, team, user, isAdmin, onBack }) {
  const qc = useQueryClient();
  const [openAdd, setOpenAdd] = useState(false);
  const [respondentName, setRespondentName] = useState("");
  const [respondentAddress, setRespondentAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [answers, setAnswers] = useState(DEFAULT_QUESTIONS.map((q) => ({ question: q, answer: "" })));

  const { data: responses = [], isLoading } = useQuery({
    queryKey: ["survey-responses", survey.id],
    queryFn: () => db.entities.SurveyResponse.filter({ survey_id: survey.id }, "-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.SurveyResponse.create(data),
    onSuccess: () => {
      qc.invalidateQueries(["survey-responses", survey.id]);
      setOpenAdd(false);
      setRespondentName("");
      setRespondentAddress("");
      setNotes("");
      setAnswers(DEFAULT_QUESTIONS.map((q) => ({ question: q, answer: "" })));
    },
  });

  const handleSubmit = () => {
    if (!respondentName) return;
    createMutation.mutate({
      survey_id: survey.id,
      team_id: team.id,
      respondent_name: respondentName,
      respondent_address: respondentAddress,
      answers: answers.filter((a) => a.answer.trim()),
      notes,
      submitted_by: user?.email,
      submitted_by_name: user?.full_name || user?.email,
    });
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-4 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Surveys
      </button>

      <Card className="p-4 bg-purple-50 border border-purple-200 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{survey.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{survey.description}</p>
            <Badge className="mt-2 text-xs border-0 bg-purple-100 text-purple-700">{survey.survey_type}</Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-700">{responses.length}</p>
            <p className="text-xs text-gray-500">Responses</p>
          </div>
        </div>
      </Card>

      <Button onClick={() => setOpenAdd(true)} size="sm" className="mb-4 bg-purple-600 hover:bg-purple-700 text-white gap-1">
        <Plus className="w-3 h-3" /> Add Response
      </Button>

      {isLoading ? <p className="text-sm text-gray-500">Loading...</p> :
        responses.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2" />
            <p>No responses yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map((r) => (
              <Card key={r.id} className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold text-gray-900">{r.respondent_name}</span>
                  {r.respondent_address && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{r.respondent_address}
                    </span>
                  )}
                </div>
                {r.answers && r.answers.map((a, i) => (
                  <div key={i} className="text-xs text-gray-600 mt-1">
                    <span className="text-gray-400">{a.question}</span>
                    <span className="ml-2 font-medium text-gray-800">{a.answer}</span>
                  </div>
                ))}
                {r.notes && <p className="text-xs text-gray-500 mt-2 italic">{r.notes}</p>}
                <p className="text-xs text-gray-400 mt-2">By {r.submitted_by_name}</p>
              </Card>
            ))}
          </div>
        )}

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Survey Response</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="mb-1 block">Respondent Name *</Label>
              <Input value={respondentName} onChange={(e) => setRespondentName(e.target.value)} placeholder="Full name" />
            </div>
            <div><Label className="mb-1 block">Address</Label>
              <Input value={respondentAddress} onChange={(e) => setRespondentAddress(e.target.value)} placeholder="House #, Street" />
            </div>
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Survey Questions</p>
              {answers.map((a, i) => (
                <div key={i} className="mb-2">
                  <Label className="mb-1 block text-xs text-gray-500">{a.question}</Label>
                  <Input value={a.answer} onChange={(e) => {
                    const updated = [...answers];
                    updated[i] = { ...updated[i], answer: e.target.value };
                    setAnswers(updated);
                  }} placeholder="Answer..." className="h-8 text-sm" />
                </div>
              ))}
            </div>
            <div><Label className="mb-1 block">Observations / Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any additional observations..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || !respondentName}
              className="bg-purple-600 hover:bg-purple-700 text-white">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}