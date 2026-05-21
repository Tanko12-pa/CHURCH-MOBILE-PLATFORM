import React, { useState } from "react";
import { Users, UserPlus, Trash, Edit2, Calendar, ClipboardCheck, Sparkles, Plus, CheckSquare, Search, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Member, NewComer, AttendanceRecord, SpecialEvent } from "../types";

interface ChurchManagementProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  newComers: NewComer[];
  setNewComers: React.Dispatch<React.SetStateAction<NewComer[]>>;
  attendanceLogs: AttendanceRecord[];
  setAttendanceLogs: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  specialEvents: SpecialEvent[];
  setSpecialEvents: React.Dispatch<React.SetStateAction<SpecialEvent[]>>;
  triggerToast: (icon: string, message: string) => void;
}

export default function ChurchManagement({
  members,
  setMembers,
  newComers,
  setNewComers,
  attendanceLogs,
  setAttendanceLogs,
  specialEvents,
  setSpecialEvents,
  triggerToast
}: ChurchManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState<"members" | "newcomers" | "attendance" | "events" | "evangelism">("members");

  // Search/Filters States
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilterDemographic, setMemberFilterDemographic] = useState("All");

  // Member CRUD Modals and forms
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [newMemName, setNewMemName] = useState("");
  const [newMemRole, setNewMemRole] = useState("Member");
  const [newMemEmail, setNewMemEmail] = useState("");
  const [newMemPhone, setNewMemPhone] = useState("");
  const [newMemDemographic, setNewMemDemographic] = useState<any>("Adult");
  const [newMemNotes, setNewMemNotes] = useState("");

  // Newcomer states
  const [newComerName, setNewComerName] = useState("");
  const [newComerAssignTo, setNewComerAssignTo] = useState("");
  const [newComerNotes, setNewComerNotes] = useState("");

  // Event Forms
  const [newEventName, setNewEventName] = useState("");
  const [newEventType, setNewEventType] = useState<any>("Crusade");
  const [newEventVenue, setNewEventVenue] = useState("");
  const [newEventBudget, setNewEventBudget] = useState(1500);
  const [newEventDate, setNewEventDate] = useState("2026-06-18");
  const [newEventExpected, setNewEventExpected] = useState(500);
  const [newEventNotes, setNewEventNotes] = useState("");

  // Attendance logging inputs
  const [attendanceDate, setAttendanceDate] = useState("2026-05-24");
  const [serviceTypeName, setServiceTypeName] = useState("Sunday Sovereign Grace Service");
  const [attendanceHeadcount, setAttendanceHeadcount] = useState(250);
  const [newVisitorsCount, setNewVisitorsCount] = useState(12);

  const [activeAttendanceSelection, setActiveAttendanceSelection] = useState<string>("Sunday Service");

  // Member Action creators
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName.trim()) return;

    if (editingMember) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? {
        ...m,
        name: newMemName,
        role: newMemRole,
        email: newMemEmail,
        phone: newMemPhone,
        demographic: newMemDemographic,
        notes: newMemNotes
      } : m));
      triggerToast("✓", "Member records updated.");
      setEditingMember(null);
    } else {
      const added: Member = {
        id: "mem_" + Date.now(),
        name: newMemName,
        role: newMemRole,
        email: newMemEmail,
        phone: newMemPhone,
        demographic: newMemDemographic,
        status: "Active",
        joinedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        notes: newMemNotes
      };
      setMembers(prev => [added, ...prev]);
      triggerToast("👤", `${newMemName} registered successfully.`);
    }

    // Reset fields
    setNewMemName("");
    setNewMemRole("Member");
    setNewMemEmail("");
    setNewMemPhone("");
    setNewMemDemographic("Adult");
    setNewMemNotes("");
    setShowAddMember(false);
  };

  const handleEditSetup = (mem: Member) => {
    setEditingMember(mem);
    setNewMemName(mem.name);
    setNewMemRole(mem.role);
    setNewMemEmail(mem.email);
    setNewMemPhone(mem.phone);
    setNewMemDemographic(mem.demographic);
    setNewMemNotes(mem.notes);
    setShowAddMember(true);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from registry logs?`)) {
      setMembers(prev => prev.filter(m => m.id !== id));
      triggerToast("🗑️", `${name} omitted from database.`);
    }
  };

  // Newcomer registration
  const handleAddNewcomer = () => {
    if (!newComerName.trim()) return;
    const added: NewComer = {
      id: "nc_" + Date.now(),
      name: newComerName,
      firstVisit: new Date().toLocaleDateString(),
      email: `${newComerName.toLowerCase().replace(" ", "")}@guest.com`,
      phone: "+234 80 112 3344",
      assignedTo: newComerAssignTo || "Unassigned Elder",
      status: "New",
      followUpNotes: newComerNotes || "Welcome pack distributed at terminal entrance."
    };
    setNewComers(p => [added, ...p]);
    setNewComerName("");
    setNewComerAssignTo("");
    setNewComerNotes("");
    triggerToast("🤝", "First timer registered securely.");
  };

  const handleUpdateFollowupStatus = (id: string, newStatus: any) => {
    setNewComers(p => p.map(nc => nc.id === id ? { ...nc, status: newStatus } : nc));
    triggerToast("🔄", "Follow-up schedule updated.");
  };

  const handleLogAttendanceSubmit = () => {
    const record: AttendanceRecord = {
      id: "att_" + Date.now(),
      date: attendanceDate,
      serviceType: serviceTypeName,
      attendanceCount: Number(attendanceHeadcount),
      newVisitors: Number(newVisitorsCount)
    };
    setAttendanceLogs(prev => [record, ...prev]);
    triggerToast("✓", "Sovereign attendance registry updated.");
  };

  const handleAddNewEvent = () => {
    if (!newEventName.trim()) return;
    const added: SpecialEvent = {
      id: "ev_" + Date.now(),
      name: newEventName,
      type: newEventType,
      date: newEventDate || "2026-06-18",
      venue: newEventVenue || "Sanctuary Cathedral",
      budget: newEventBudget,
      expectedAttendance: newEventExpected || 500,
      notes: newEventNotes || "Logistical and prayer outlines attached.",
      checklist: [
        { task: "Mobilize intercession night team", done: false },
        { task: "Brief technical and synth sound booth", done: false },
        { task: "Design golden theme flyers", done: false }
      ]
    };
    setSpecialEvents(prev => [added, ...prev]);
    setNewEventName("");
    setNewEventVenue("");
    setNewEventDate("2026-06-18");
    setNewEventExpected(500);
    setNewEventNotes("");
    triggerToast("📅", `Special event '${newEventName}' scheduled.`);
  };

  const toggleChecklistTask = (eventId: string, taskIdx: number) => {
    setSpecialEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const updated = [...ev.checklist];
        updated[taskIdx].done = !updated[taskIdx].done;
        return { ...ev, checklist: updated };
      }
      return ev;
    }));
  };

  // Filtered members list
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
                          m.role.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          m.email.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesDemo = memberFilterDemographic === "All" || m.demographic === memberFilterDemographic;
    return matchesSearch && matchesDemo;
  });

  return (
    <div className="space-y-4">
      {/* Tab selectors */}
      <div className="flex flex-wrap gap-1 border-b border-[#D4AF37]/25 pb-2">
        {[
          { id: "members", label: "Member Records & Registry", icon: Users },
          { id: "newcomers", label: "First Timers & Follow-Up", icon: UserPlus },
          { id: "attendance", label: "Attendance Visualizers", icon: ClipboardCheck },
          { id: "events", label: "Special Events & Crusades", icon: Calendar }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id as any)}
            className={`flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg border transition-luxury font-sans-raleway font-semibold cursor-pointer ${
              activeSubTab === sub.id 
                ? "bg-[#D4AF37] border-[#D4AF37] text-[#0A0F1E] font-bold"
                : "bg-[#0A0F1E] border-white/10 text-[#B0C4DE] hover:bg-[#112055]/40"
            }`}
          >
            <sub.icon className="w-3.5 h-3.5" />
            {sub.label}
          </button>
        ))}
      </div>

      {/* 1. MEMBER RECORDS REGISTRY */}
      {activeSubTab === "members" && (
        <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-4 gold-glow">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-sm font-serif-cinzel font-bold text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#D4AF37]" /> Core Congregation Registry
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search name, role, email..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className="bg-[#0A0F1E] border border-[#D4AF37]/25 text-white pl-8 pr-3 py-1.5 rounded-lg text-xs w-44 focus:outline-none"
                />
              </div>

              <select 
                value={memberFilterDemographic}
                onChange={e => setMemberFilterDemographic(e.target.value)}
                className="bg-[#0A0F1E] border border-[#D4AF37]/25 text-white rounded-lg text-xs px-2 py-1.5 focus:outline-none"
              >
                <option value="All">All Sections</option>
                <option value="Children">Children</option>
                <option value="Youth">Youth Assembly</option>
                <option value="Adult">Adult Assembly</option>
                <option value="Men">Men's Fellowship</option>
                <option value="Women">Women's Fellowship</option>
              </select>

              <button 
                onClick={() => {
                  setShowAddMember(true);
                  setEditingMember(null);
                }}
                className="bg-[#D4AF37] hover:bg-[#F0C940] text-[#0A0F1E] font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Register Member
              </button>
            </div>
          </div>

          {/* Member Registration Modal */}
          {showAddMember && (
            <div className="bg-[#0A0F1E] border border-[#D4AF37]/50 rounded-xl p-4 space-y-3 font-sans-raleway animate-fade-in">
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                {editingMember ? "Revise Member File" : "Register New Covenant Disciple"}
              </h4>
              <form onSubmit={handleAddMemberSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Full Name</label>
                  <input type="text" required value={newMemName} onChange={e => setNewMemName(e.target.value)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Ministry Role</label>
                  <input type="text" value={newMemRole} onChange={e => setNewMemRole(e.target.value)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Email Address</label>
                  <input type="email" value={newMemEmail} onChange={e => setNewMemEmail(e.target.value)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Phone Line</label>
                  <input type="text" value={newMemPhone} onChange={e => setNewMemPhone(e.target.value)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Congregational Section</label>
                  <select value={newMemDemographic} onChange={e => setNewMemDemographic(e.target.value as any)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5">
                    <option value="Adult">Adult Assembly</option>
                    <option value="Children">Children's Ministry</option>
                    <option value="Youth">Youth Assembly</option>
                    <option value="Men">Men's Fellowship</option>
                    <option value="Women">Women's Fellowship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Internal Notes</label>
                  <input type="text" value={newMemNotes} onChange={e => setNewMemNotes(e.target.value)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5" />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowAddMember(false)} className="bg-transparent border border-white/10 text-white text-xs px-3 py-1.5 rounded">
                    Cancel
                  </button>
                  <button type="submit" className="bg-[#D4AF37] text-[#0A0F1E] font-bold text-xs px-4 py-1.5 rounded">
                    {editingMember ? "Save Changes" : "Confirm Registrations"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members list layout Grid */}
          <div className="overflow-x-auto rounded-lg border border-white/5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0A0F1E] border-b border-white/10 text-[#B0C4DE]">
                  <th className="p-3 font-semibold">Name / Member ID</th>
                  <th className="p-3 font-semibold">Role</th>
                  <th className="p-3 font-semibold">Demographic</th>
                  <th className="p-3 font-semibold">Contact Details</th>
                  <th className="p-3 font-semibold">Joined Date</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-[#112055]/30 transition text-slate-300">
                    <td className="p-3">
                      <p className="font-bold text-white">{m.name}</p>
                      <p className="text-[10px] text-[#D4AF37] font-memo uppercase">{m.id}</p>
                    </td>
                    <td className="p-3">{m.role}</td>
                    <td className="p-3">
                      <span className="bg-[#112055] border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] px-2 py-0.5 rounded">
                        {m.demographic}
                      </span>
                    </td>
                    <td className="p-3 font-memo text-[11px]">
                      <p>{m.email}</p>
                      <p className="text-slate-400">{m.phone}</p>
                    </td>
                    <td className="p-3 text-slate-400">{m.joinedAt}</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEditSetup(m)} className="text-[#D4AF37] hover:bg-white/5 p-1 rounded transition">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteMember(m.id, m.name)} className="text-rose-400 hover:bg-white/5 p-1 rounded transition">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] text-slate-400">Showing {filteredMembers.length} registries</span>
            <button
              onClick={() => {
                const header = "Member ID,Name,Role,Demographic,Email,Phone,Joined At\n";
                const rows = members.map(m => `"${m.id}","${m.name}","${m.role}","${m.demographic}","${m.email}","${m.phone}","${m.joinedAt}"`).join("\n");
                const blob = new Blob([header + rows], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "faithflow_members_registry.csv";
                a.click();
                triggerToast("💾", "Members database backup downloaded.");
              }}
              className="bg-[#112055] hover:bg-[#112055]/80 border border-[#D4AF37]/30 text-white text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" /> Export Database Backup
            </button>
          </div>
        </div>
      )}

      {/* 2. FIRST TIMERS & NEW COMERS */}
      {activeSubTab === "newcomers" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick guest check-in */}
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5 self-start">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" /> Guest Welcome Counter
            </span>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">First-Timer Name</label>
              <input type="text" placeholder="e.g. Sister Mercy Adams" value={newComerName} onChange={e => setNewComerName(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20" />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Assigned Follow-Up Minister</label>
              <input type="text" placeholder="e.g. Brother Asante" value={newComerAssignTo} onChange={e => setNewComerAssignTo(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20" />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Initial Greetings Note</label>
              <textarea placeholder="e.g. Salvation decision made, requested water baptism." value={newComerNotes} onChange={e => setNewComerNotes(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-1.5 rounded border border-[#D4AF37]/20 h-16 resize-none" />
            </div>
            <button onClick={handleAddNewcomer} className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 rounded-lg transition">
              Register Guest
            </button>
          </div>

          {/* Newcomers grid lists */}
          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Assigned Follow-Up & Integration Gauge</span>
            <div className="space-y-3">
              {newComers.map(nc => (
                <div key={nc.id} className="bg-[#112055]/30 border border-white/5 rounded-lg p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3 font-sans-raleway text-xs text-[#B0C4DE]">
                  <div>
                    <h4 className="text-white font-bold text-sm">{nc.name}</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Checked In on: {nc.firstVisit}</p>
                    <p className="text-[11px] text-slate-300 mt-1 italic">"{nc.followUpNotes}"</p>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <p className="text-[10px] text-[#D4AF37]">Follow Up: <strong className="text-white">{nc.assignedTo}</strong></p>
                    <div className="flex gap-1.5 justify-end">
                      {["New", "Contacted", "Attending", "Converted", "Member"].map(st => (
                        <button
                          key={st}
                          onClick={() => handleUpdateFollowupStatus(nc.id, st as any)}
                          className={`text-[9px] px-1.5 py-0.5 rounded border transition-luxury cursor-pointer ${
                            nc.status === st 
                              ? "bg-[#D4AF37] border-[#D4AF37] text-black font-bold text-[10px]"
                              : "bg-transparent border-white/10 text-slate-400 hover:text-white"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. ATTENDANCE METRICS VISUAL */}
      {activeSubTab === "attendance" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5 self-start">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Service Attendance Intake</span>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Gathering Service Type</label>
              <select
                value={activeAttendanceSelection}
                onChange={e => {
                  setActiveAttendanceSelection(e.target.value);
                  setServiceTypeName(e.target.value);
                }}
                className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20"
              >
                <option value="Sunday Service">Sunday Worship & Word Service</option>
                <option value="Mid-week Study">Mid-week Bible Exposition</option>
                <option value="Prayer Vigil">Miracle & Deliverance Vigil</option>
                <option value="Youth Consecration">Youth Consecration Encounter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Headcount Ledger Total</label>
              <input type="number" value={attendanceHeadcount} onChange={e => setAttendanceHeadcount(Number(e.target.value))} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20" />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">First-Time Visitors Total</label>
              <input type="number" value={newVisitorsCount} onChange={e => setNewVisitorsCount(Number(e.target.value))} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20" />
            </div>
            <button onClick={handleLogAttendanceSubmit} className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 rounded-xl transition">
              Log Attendance Registry
            </button>
          </div>

          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-4">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Congregational Turnout Growth Chart</span>
            
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceLogs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#112055" />
                  <XAxis dataKey="date" stroke="#6B84A8" fontSize={10} />
                  <YAxis stroke="#6B84A8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#0D1B3E", color: "#FFF", borderColor: "#D4AF37" }} />
                  <Line type="monotone" dataKey="attendanceCount" name="Headcount" stroke="#D4AF37" strokeWidth={2} />
                  <Line type="monotone" dataKey="newVisitors" name="New Guests" stroke="#22C55E" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-[#112055]/30 p-2.5 rounded border border-[#D4AF37]/20">
                <span className="text-slate-400">Registry average</span>
                <p className="text-lg font-bold text-[#D4AF37]">
                  {Math.round(attendanceLogs.reduce((acc, current) => acc + current.attendanceCount, 0) / (attendanceLogs.length || 1))} members
                </p>
              </div>
              <div className="bg-[#112055]/30 p-2.5 rounded border border-[#D4AF37]/20">
                <span className="text-slate-400">Recorded events</span>
                <p className="text-lg font-bold text-emerald-400">{attendanceLogs.length} assemblies</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SPECIAL EVENTS & CRUSADES */}
      {activeSubTab === "events" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5 self-start">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Plan Crusades & Conferences</span>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Program Event Name</label>
              <input type="text" placeholder="e.g. Zion Breakthrough Retreat" value={newEventName} onChange={e => setNewEventName(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Event Category</label>
              <select value={newEventType} onChange={e => setNewEventType(e.target.value as any)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none">
                <option value="Crusade">Evangelism Miracle Crusade</option>
                <option value="Retreat">Ministers Retreat</option>
                <option value="Conference">Faith Sovereignty Conference</option>
                <option value="Concert">Worship Synth Concert</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 font-sans">
              <div>
                <label className="block text-[#B0C4DE] text-[10px] mb-0.5">Event Date</label>
                <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none" />
              </div>
              <div>
                <label className="block text-[#B0C4DE] text-[10px] mb-0.5">Target Souls</label>
                <input type="number" value={newEventExpected} onChange={e => setNewEventExpected(Number(e.target.value))} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Operational Venue</label>
              <input type="text" placeholder="e.g. National Stadium" value={newEventVenue} onChange={e => setNewEventVenue(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Est. Operational Budget ($)</label>
              <input type="number" value={newEventBudget} onChange={e => setNewEventBudget(Number(e.target.value))} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Logistical Planners Notes</label>
              <textarea placeholder="Outline team directives, dynamic goals..." value={newEventNotes} onChange={e => setNewEventNotes(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 h-16 resize-none focus:border-[#D4AF37]/60 outline-none" />
            </div>
            <button onClick={handleAddNewEvent} className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 rounded-lg transition shadow-md shadow-[#D4AF37]/15">
              Establish Schedule Planner
            </button>
          </div>

          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-3.5 font-sans-raleway text-xs text-[#B0C4DE]">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block border-b border-white/5 pb-1">Active Crusades Log & Logistics List</span>
            
            <div className="space-y-4">
              {specialEvents.length === 0 ? (
                <div className="bg-[#112055]/10 border border-white/5 rounded-xl p-6 text-center text-slate-400">
                  No active scheduled events on file. Use the Plan panel to schedule one.
                </div>
              ) : (
                specialEvents.map(ev => {
                  const tasksDone = ev.checklist?.filter(t => t.done).length || 0;
                  const totalTasks = ev.checklist?.length || 0;
                  return (
                    <div key={ev.id} className="bg-[#112055]/20 border border-white/5 rounded-xl p-3.5 space-y-3 relative group">
                      <div className="flex justify-between items-start border-b border-white/5 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#D4AF37] font-semibold text-xs bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/25">[ {ev.type} ]</span>
                            <span className="text-[10px] text-[#B0C4DE] font-mono">{ev.date}</span>
                          </div>
                          <h4 className="text-white font-bold text-sm mt-1">{ev.name}</h4>
                          <p className="text-[11px] text-slate-300 mt-0.5">📍 Venue: <span className="font-semibold text-white">{ev.venue}</span></p>
                        </div>
                        <div className="text-right text-[11px] flex gap-3 items-start">
                          <div>
                            <p className="text-[#D4AF37] font-bold font-mono">${ev.budget} budget</p>
                            <p className="text-slate-400 font-semibold">{ev.expectedAttendance} target souls</p>
                            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">{tasksDone} / {totalTasks} tasks complete</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to cancel the event: '${ev.name}'?`)) {
                                setSpecialEvents(prev => prev.filter(e => e.id !== ev.id));
                                triggerToast("🗑️", `Special event '${ev.name}' cancelled.`);
                              }
                            }}
                            className="text-[#B0C4DE]/40 hover:text-red-400 p-1 rounded hover:bg-red-500/10 cursor-pointer transition"
                            title="Cancel Scheduled Event"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {ev.notes && (
                        <p className="text-[11px] text-[#B0C4DE] bg-[#0A0F1E]/50 p-2.5 rounded border border-white/5 italic">
                          "{ev.notes}"
                        </p>
                      )}

                      {/* Program Tasks checklist */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Organizing Checklist Logs</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ev.checklist?.map((task, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between bg-[#0D1B3E] p-2 rounded border border-white/5 group/task hover:border-[#D4AF37]/35 transition"
                            >
                              <div
                                onClick={() => toggleChecklistTask(ev.id, idx)}
                                className="flex items-center gap-2 cursor-pointer flex-1"
                              >
                                <input 
                                  type="checkbox" 
                                  checked={task.done}
                                  onChange={() => {}} // toggled on click
                                  className="accent-emerald-500 cursor-pointer"
                                />
                                <span className={`text-[11px] ${task.done ? "line-through text-slate-500" : "text-white"}`}>{task.task}</span>
                              </div>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSpecialEvents(prev => prev.map(item => {
                                    if (item.id === ev.id) {
                                      return {
                                        ...item,
                                        checklist: item.checklist.filter((_, tIdx) => tIdx !== idx)
                                      };
                                    }
                                    return item;
                                  }));
                                  triggerToast("🗑️", "Removed task from checklist.");
                                }}
                                className="opacity-0 group-hover/task:opacity-100 text-red-400 hover:text-red-300 px-1 transition cursor-pointer"
                                title="Delete Task"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Direct task input creator to improve workflow */}
                        <div className="flex gap-1.5 mt-2.5 pt-1.5 border-t border-white/5">
                          <input 
                            type="text" 
                            placeholder="Add logistical objective to checklist..." 
                            id={`new-task-${ev.id}`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (!val) return;
                                setSpecialEvents(prev => prev.map(item => {
                                  if (item.id === ev.id) {
                                    return {
                                      ...item,
                                      checklist: [...(item.checklist || []), { task: val, done: false }]
                                    };
                                  }
                                  return item;
                                }));
                                (e.target as HTMLInputElement).value = "";
                                triggerToast("➕", "Added custom task to checklist.");
                              }
                            }}
                            className="flex-1 bg-[#0A0F1E] text-white text-[11px] px-2.5 py-1 rounded border border-white/10 outline-none focus:border-[#D4AF37]/50"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const inputEl = document.getElementById(`new-task-${ev.id}`) as HTMLInputElement;
                              const val = inputEl?.value.trim();
                              if (!val) return;
                              setSpecialEvents(prev => prev.map(item => {
                                  if (item.id === ev.id) {
                                    return {
                                      ...item,
                                      checklist: [...(item.checklist || []), { task: val, done: false }]
                                    };
                                  }
                                  return item;
                                }));
                              inputEl.value = "";
                              triggerToast("➕", "Added custom task to checklist.");
                            }}
                            className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/30 text-[#D4AF37] px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all shrink-0"
                          >
                            Add Task
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
