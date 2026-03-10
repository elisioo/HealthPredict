import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import { profileApi } from "../../api/authApi";

const GENDER_OPTS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const SMOKING_OPTS = [
  { value: "non-smoker", label: "Non-Smoker" },
  { value: "former", label: "Former Smoker" },
  { value: "current", label: "Current Smoker" },
];

const EMPTY_FORM = {
  date_of_birth: "",
  gender: "",
  height_cm: "",
  weight_kg: "",
  smoking_status: "",
};

function isProfileComplete(p) {
  return !!(
    p &&
    p.date_of_birth &&
    p.gender &&
    p.height_cm &&
    p.weight_kg &&
    p.smoking_status
  );
}

function calcBmi(height_cm, weight_kg) {
  const h = parseFloat(height_cm);
  const w = parseFloat(weight_kg);
  if (!h || !w || h <= 0) return "";
  return (w / ((h / 100) ** 2)).toFixed(1);
}

function bmiCategory(bmi) {
  const b = parseFloat(bmi);
  if (!b) return "";
  if (b < 18.5) return { label: "Underweight", color: "text-blue-500" };
  if (b < 25) return { label: "Normal", color: "text-green-600" };
  if (b < 30) return { label: "Overweight", color: "text-yellow-600" };
  return { label: "Obese", color: "text-red-500" };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi
      .getHealthProfile()
      .then(({ data }) => {
        setProfile(data.profile);
        if (data.profile) {
          setForm({
            date_of_birth: data.profile.date_of_birth
              ? data.profile.date_of_birth.split("T")[0]
              : "",
            gender: data.profile.gender || "",
            height_cm: data.profile.height_cm ?? "",
            weight_kg: data.profile.weight_kg ?? "",
            smoking_status: data.profile.smoking_status || "",
          });
        }
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const bmi = calcBmi(form.height_cm, form.weight_kg);
  const bmiMeta = bmiCategory(bmi);
  const verified = isProfileComplete(profile);

  const handleEdit = () => {
    setSaveError("");
    setSaveSuccess("");
    setEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        date_of_birth: profile.date_of_birth
          ? profile.date_of_birth.split("T")[0]
          : "",
        gender: profile.gender || "",
        height_cm: profile.height_cm ?? "",
        weight_kg: profile.weight_kg ?? "",
        smoking_status: profile.smoking_status || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setSaveError("");
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const { data } = await profileApi.updateHealthProfile({
        ...form,
        bmi: bmi ? parseFloat(bmi) : null,
      });
      setProfile(data.profile);
      setEditing(false);
      setSaveSuccess("Health profile updated successfully.");
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setSaveError(
        msgs?.length
          ? msgs.map((e) => e.msg).join(" • ")
          : err.response?.data?.error || "Failed to save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (hasErr) =>
    `block w-full px-3 py-2.5 border ${
      hasErr ? "border-red-400" : "border-slate-200"
    } rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:bg-slate-50 disabled:text-slate-500`;

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.patient}
      title="My Profile"
      subtitle="Manage your account and health information"
    >
      <div className="max-w-2xl space-y-6">

        {/* ── Account Info Card ─────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <i className="fa-solid fa-user text-primary text-xl"></i>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {user?.fullName || "User"}
                </h2>
                <p className="text-sm text-gray-500">
                  {user?.role === "health_user" ? "Health User" : user?.role}
                </p>
              </div>
            </div>

            {/* Verification badge */}
            {verified ? (
              <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
                <i className="fa-solid fa-circle-check"></i> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200">
                <i className="fa-solid fa-circle-exclamation"></i> Unverified
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm font-medium text-gray-900">{user?.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</p>
              <p className="text-sm font-medium text-gray-900">{user?.phone || "Not set"}</p>
            </div>
          </div>
        </div>

        {/* ── Health Profile Card ───────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Health Profile
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {verified
                  ? "Your health profile is complete."
                  : "Complete your health profile to get verified."}
              </p>
            </div>
            {!editing && !loading && (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <i className="fa-solid fa-pen-to-square text-xs"></i>
                {profile ? "Edit" : "Complete Profile"}
              </button>
            )}
          </div>

          {/* Success / error banners */}
          {saveSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl mb-4">
              <i className="fa-solid fa-circle-check"></i>
              {saveSuccess}
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl mb-4">
              <i className="fa-solid fa-circle-xmark"></i>
              {saveError}
            </div>
          )}
          {loadError && (
            <div className="text-sm text-red-500 mb-4">
              Failed to load health profile.
            </div>
          )}

          {loading ? (
            <div className="text-sm text-gray-400 py-4 text-center">
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>Loading...
            </div>
          ) : editing ? (
            /* ── Edit Form ──────────────────────────────────── */
            <div className="space-y-4">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => set("date_of_birth", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={inputClass(false)}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Gender
                </label>
                <div className="flex gap-3">
                  {GENDER_OPTS.map((o) => (
                    <label
                      key={o.value}
                      className={`flex-1 flex items-center justify-center gap-2 border rounded-xl py-2.5 text-sm cursor-pointer transition-all ${
                        form.gender === o.value
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={o.value}
                        checked={form.gender === o.value}
                        onChange={() => set("gender", o.value)}
                        className="hidden"
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="300"
                    step="0.1"
                    value={form.height_cm}
                    onChange={(e) => set("height_cm", e.target.value)}
                    placeholder="e.g. 170"
                    className={inputClass(false)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={(e) => set("weight_kg", e.target.value)}
                    placeholder="e.g. 65"
                    className={inputClass(false)}
                  />
                </div>
              </div>

              {/* BMI (auto-calculated, read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  BMI{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    (auto-calculated)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={bmi}
                    readOnly
                    placeholder="Fill height & weight"
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500"
                  />
                  {bmi && (
                    <span className={`text-sm font-semibold whitespace-nowrap ${bmiMeta.color}`}>
                      {bmiMeta.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Smoking Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Smoking Status
                </label>
                <div className="flex gap-3">
                  {SMOKING_OPTS.map((o) => (
                    <label
                      key={o.value}
                      className={`flex-1 flex items-center justify-center gap-2 border rounded-xl py-2.5 text-sm cursor-pointer transition-all ${
                        form.smoking_status === o.value
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="smoking_status"
                        value={o.value}
                        checked={form.smoking_status === o.value}
                        onChange={() => set("smoking_status", o.value)}
                        className="hidden"
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {saving ? (
                    <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving...</>
                  ) : (
                    "Save Health Profile"
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : profile ? (
            /* ── Read-only View ─────────────────────────────── */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="text-sm font-medium text-gray-900">
                  {profile.date_of_birth
                    ? new Date(profile.date_of_birth).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Gender</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {profile.gender || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Height</p>
                <p className="text-sm font-medium text-gray-900">
                  {profile.height_cm ? `${profile.height_cm} cm` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Weight</p>
                <p className="text-sm font-medium text-gray-900">
                  {profile.weight_kg ? `${profile.weight_kg} kg` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">BMI</p>
                <p className="text-sm font-medium text-gray-900">
                  {profile.bmi ? (
                    <>
                      {profile.bmi}{" "}
                      <span className={`text-xs font-semibold ${bmiCategory(profile.bmi).color}`}>
                        ({bmiCategory(profile.bmi).label})
                      </span>
                    </>
                  ) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Smoking Status</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {profile.smoking_status
                    ? SMOKING_OPTS.find((o) => o.value === profile.smoking_status)?.label
                    : "—"}
                </p>
              </div>
            </div>
          ) : (
            /* ── Empty State ────────────────────────────────── */
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fa-solid fa-file-medical text-amber-500 text-xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-700">No health profile yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Click "Complete Profile" above to fill in your health details and get verified.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
