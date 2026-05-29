/**
 * Migrated from: FlankSpeedLegacyDemo.Web/Views/Cwa/Create.cshtml + Edit.cshtml
 *               + wwwroot/js/cwa-form.js (conditional visibility logic)
 *
 * This component combines the Create and Edit views into a single form component
 * with conditional field visibility based on Priority and Category selection.
 *
 * Power Fx equivalent:
 *   - EditForm with DefaultMode = FormMode.New or FormMode.Edit
 *   - Justification.Visible = If(dropdownPriority.Selected.Value = "Critical", true, false)
 *   - FacilitySection.Visible = If(dropdownCategory.Selected.Value = "Facility Access Request", true, false)
 *
 * KEY DEMO POINT: The conditional visibility pattern is a primary selling point
 * for Power Apps migration — Power Fx If()/Visible maps directly to React state.
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  WorkItemFormData,
  Category,
  Priority,
  AccessLevel,
  PRIORITIES,
  ACCESS_LEVELS,
} from "../models";
import {
  createWorkItem,
  updateWorkItem,
  getWorkItemById,
  getCwaCategories,
  validateWorkItem,
  getConditionalVisibility,
} from "../services/WorkItemService";

interface RequestFormProps {
  mode: "create" | "edit";
}

export function RequestForm({ mode }: RequestFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<WorkItemFormData>({
    title: "",
    description: "",
    categoryId: 0,
    priority: "Medium",
    dueDate: "",
    justification: "",
    buildingNumber: "",
    accessLevel: "",
  });

  // Load categories and existing data (for edit mode)
  useEffect(() => {
    getCwaCategories().then(setCategories);

    if (mode === "edit" && id) {
      getWorkItemById(Number(id)).then((item) => {
        if (item) {
          setFormData({
            title: item.title,
            description: item.description ?? "",
            categoryId: item.categoryId,
            priority: item.priority,
            dueDate: item.dueDate ?? "",
            justification: item.justification ?? "",
            buildingNumber: item.buildingNumber ?? "",
            accessLevel: (item.accessLevel as AccessLevel) ?? "",
          });
        }
      });
    }
  }, [mode, id]);

  // Conditional visibility — migrated from cwa-form.js
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const { showJustification, showFacilitySection } = getConditionalVisibility(
    formData.priority,
    selectedCategory?.name ?? ""
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors = validateWorkItem(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        const created = await createWorkItem(formData);
        navigate(`/cwa/details/${created.id}`);
      } else if (id) {
        await updateWorkItem(Number(id), formData);
        navigate(`/cwa/details/${id}`);
      }
    } catch {
      setErrors(["An error occurred while saving. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>{mode === "create" ? "Submit New Request" : "Edit Request"}</h2>
      <a
        href="/cwa"
        className="btn btn-default btn-sm"
        onClick={(e) => {
          e.preventDefault();
          navigate("/cwa");
        }}
      >
        &laquo; Back to List
      </a>
      <hr />

      {errors.length > 0 && (
        <div className="alert alert-danger">
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information — Legacy: <fieldset> "Basic Information" */}
        <fieldset>
          <legend>Basic Information</legend>

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              required
              placeholder="Enter request title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows={4}
              placeholder="Describe your request..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              className="form-control"
              required
              value={formData.categoryId}
              onChange={handleChange}
            >
              <option value="">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              className="form-control"
              value={formData.priority}
              onChange={handleChange}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              className="form-control"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        {/* Justification Section — conditionally visible when Priority = "Critical" */}
        {/* Power Fx: If(dropdownPriority.Selected.Value = "Critical", true, false) */}
        {showJustification && (
          <fieldset>
            <legend>Justification (Required for Critical Priority)</legend>
            <div className="form-group">
              <label htmlFor="justification">Justification</label>
              <textarea
                id="justification"
                name="justification"
                className="form-control"
                rows={3}
                placeholder="Explain why this request is critical..."
                value={formData.justification}
                onChange={handleChange}
              />
            </div>
          </fieldset>
        )}

        {/* Facility Access Section — conditionally visible when Category = "Facility Access Request" */}
        {/* Power Fx: If(dropdownCategory.Selected.Value = "Facility Access Request", true, false) */}
        {showFacilitySection && (
          <fieldset>
            <legend>Facility Access Details</legend>
            <div className="form-group">
              <label htmlFor="buildingNumber">Building Number</label>
              <input
                type="text"
                id="buildingNumber"
                name="buildingNumber"
                className="form-control"
                placeholder="e.g., Building 12"
                value={formData.buildingNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="accessLevel">Access Level</label>
              <select
                id="accessLevel"
                name="accessLevel"
                className="form-control"
                value={formData.accessLevel}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                {ACCESS_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
            : mode === "create"
              ? "Submit Request"
              : "Save Changes"}
        </button>
        <button
          type="button"
          className="btn btn-default"
          onClick={() => navigate("/cwa")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
