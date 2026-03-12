import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import { staffApi } from "../../api/authApi";
import ConfirmModal from "../../components/ConfirmModal";
import stripTags from "../../utils/stripTags";

function StaffTeamView() {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffApi
      .getMyTeam()
      .then(({ data }) => {
        setTeam(data.team);
        setMembers(data.members || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <i className="fa-solid fa-spinner fa-spin text-xl text-primary"></i>
      </div>
    );
  if (!team)
    return (
      <div className="text-center py-16">
        <i className="fa-solid fa-users-slash text-5xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Team Assigned
        </h3>
        <p className="text-gray-500">
          You haven't been assigned to a medical team yet. Please contact your
          administrator.
        </p>
      </div>
    );

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {team.team_name}
        </h3>
        {team.description && (
          <p className="text-gray-500 text-sm">{team.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Created by {team.creator_name}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((m) => (
          <div
            key={m.user_id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {m.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{m.full_name}</h3>
                <p className="text-sm text-gray-500 capitalize">{m.role}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">{m.email}</p>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${m.availability_status === "available" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
            >
              {m.availability_status || "Available"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTeamView() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ team_name: "", description: "" });
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchTeams = useCallback(async () => {
    try {
      const { data } = await staffApi.getTeams();
      setTeams(data.teams || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnassigned = useCallback(async () => {
    try {
      const { data } = await staffApi.getUnassignedStaff();
      setUnassigned(data.staff || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchTeams();
    fetchUnassigned();
  }, [fetchTeams, fetchUnassigned]);

  const openTeamDetail = async (team) => {
    setSelectedTeam(team);
    try {
      const { data } = await staffApi.getTeam(team.team_id);
      setMembers(data.members || []);
    } catch {
      setMembers([]);
    }
  };

  const openCreate = () => {
    setForm({ team_name: "", description: "" });
    setSelectedMemberIds([]);
    setError("");
    setShowCreate(true);
  };

  const openEdit = () => {
    if (!selectedTeam) return;
    setForm({
      team_name: selectedTeam.team_name,
      description: selectedTeam.description || "",
    });
    setSelectedMemberIds(members.map((m) => m.user_id));
    setError("");
    setShowEdit(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.team_name.trim()) {
      setError("Team name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await staffApi.createTeam({ ...form, member_ids: selectedMemberIds });
      setShowCreate(false);
      await fetchTeams();
      await fetchUnassigned();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create team");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.team_name.trim()) {
      setError("Team name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await staffApi.updateTeam(selectedTeam.team_id, {
        ...form,
        member_ids: selectedMemberIds,
      });
      setShowEdit(false);
      await fetchTeams();
      await fetchUnassigned();
      // refresh detail
      const { data } = await staffApi.getTeam(selectedTeam.team_id);
      setSelectedTeam({
        ...selectedTeam,
        team_name: form.team_name,
        description: form.description,
      });
      setMembers(data.members || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update team");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await staffApi.deleteTeam(deleteTarget.team_id);
      setDeleteTarget(null);
      if (selectedTeam?.team_id === deleteTarget.team_id) {
        setSelectedTeam(null);
        setMembers([]);
      }
      await fetchTeams();
      await fetchUnassigned();
    } catch {
      /* ignore */
    }
  };

  const toggleMember = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // All staff available for selection = unassigned + currently in this team (for edit)
  const availableStaff = showEdit
    ? [
        ...unassigned,
        ...members.map((m) => ({
          user_id: m.user_id,
          full_name: m.full_name,
          email: m.email,
        })),
      ]
    : unassigned;

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <i className="fa-solid fa-spinner fa-spin text-xl text-primary"></i>
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {teams.length} Team{teams.length !== 1 ? "s" : ""}
          </h3>
          <p className="text-sm text-gray-500">
            {unassigned.length} unassigned staff
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> New Team
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team list */}
        <div className="lg:col-span-1 space-y-3">
          {teams.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              No teams created yet
            </div>
          ) : (
            teams.map((t) => (
              <button
                key={t.team_id}
                onClick={() => openTeamDetail(t)}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-colors hover:border-primary ${selectedTeam?.team_id === t.team_id ? "border-primary ring-2 ring-primary/20" : "border-gray-200"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {t.team_name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.member_count || 0} member
                      {t.member_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(t);
                    }}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Team detail */}
        <div className="lg:col-span-2">
          {!selectedTeam ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <i className="fa-solid fa-users text-4xl mb-3 block"></i>
              Select a team to view its members
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedTeam.team_name}
                  </h3>
                  {selectedTeam.description && (
                    <p className="text-sm text-gray-500">
                      {selectedTeam.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={openEdit}
                  className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                >
                  <i className="fa-solid fa-pen-to-square"></i> Edit
                </button>
              </div>
              <div className="p-6">
                {members.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    No members assigned yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {members.map((m) => (
                      <div
                        key={m.user_id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                          {m.full_name?.charAt(0) || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {m.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {m.email}
                          </p>
                        </div>
                        <span
                          className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${m.availability_status === "available" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {m.availability_status || "Available"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit modal */}
      {(showCreate || showEdit) && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowCreate(false);
            setShowEdit(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {showCreate ? "Create Team" : "Edit Team"}
              </h3>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setShowEdit(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form
              onSubmit={showCreate ? handleCreate : handleUpdate}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={form.team_name}
                  onChange={(e) =>
                    setForm({ ...form, team_name: stripTags(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                  placeholder="e.g. Cardiology Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: stripTags(e.target.value) })
                  }
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm resize-none"
                  placeholder="Optional description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Staff Members
                </label>
                {availableStaff.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No available staff to assign
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-100">
                    {availableStaff.map((s) => (
                      <label
                        key={s.user_id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(s.user_id)}
                          onChange={() => toggleMember(s.user_id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {s.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {s.email}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setShowEdit(false);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <i className="fa-solid fa-spinner fa-spin"></i>}
                  {showCreate ? "Create Team" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Team"
          message={`Are you sure you want to delete "${deleteTarget.team_name}"? All members will be unassigned.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* Main export — role-aware wrapper                                    */
/* ──────────────────────────────────────────────────────────────────── */
export default function MedicalTeamPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const roleNav = isAdmin ? NAV_BY_ROLE.admin : NAV_BY_ROLE.staff;

  return (
    <DashboardLayout
      navItems={roleNav}
      title="Medical Team"
      subtitle={
        isAdmin ? "Manage teams and assign staff" : "Your team directory"
      }
    >
      {isAdmin ? <AdminTeamView /> : <StaffTeamView />}
    </DashboardLayout>
  );
}
