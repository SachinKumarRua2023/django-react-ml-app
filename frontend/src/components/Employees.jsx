import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://django-react-ml-app.onrender.com/api/employees/";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: "",
    age: "",
    department: "",
    salary: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setEmployees(res.data);
    } catch (error) {
      console.error("Fetch Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.department || !form.salary) {
      alert("All fields are required");
      return;
    }

    const payload = {
      name: form.name,
      age: Number(form.age),
      department: form.department,
      salary: Number(form.salary)
    };

    try {
      if (editId) {
        await axios.put(`${API}${editId}/`, payload);
        setEditId(null);
      } else {
        await axios.post(API, payload);
      }

      setForm({ name: "", age: "", department: "", salary: "" });
      fetchData();
    } catch (error) {
      console.error("Submit Error:", error.response?.data || error.message);
      alert("Failed to save data. Check console.");
    }
  };

  const handleEdit = (emp) => {
    setForm({
      name: emp.name,
      age: emp.age,
      department: emp.department,
      salary: emp.salary
    });
    setEditId(emp.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`${API}${id}/`);
      fetchData();
    } catch (error) {
      console.error("Delete Error:", error.response?.data || error.message);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ name: "", age: "", department: "", salary: "" });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">👥 Team Management</h1>
        <p className="page-subtitle">Manage your team members and track performance</p>
      </div>

      <div className="employees-layout">
        {/* Form Card */}
        <div className="employee-form-card">
          <h3 className="form-title">
            {editId ? "✏️ Edit Member" : "➕ Add New Member"}
          </h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                placeholder="Enter name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                placeholder="Enter age"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                placeholder="e.g., IT, Marketing"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Salary (₹)</label>
              <input
                type="number"
                placeholder="Enter salary"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={handleSubmit}
              className={`btn ${editId ? 'btn-warning' : 'btn-primary'}`}
            >
              {editId ? "💾 Update Member" : "➕ Add Member"}
            </button>
            
            {editId && (
              <button onClick={handleCancel} className="btn btn-secondary">
                ❌ Cancel
              </button>
            )}
          </div>
        </div>

        {/* Employees List */}
        <div className="employees-list">
          <div className="list-header">
            <h3>Team Members ({employees.length})</h3>
            {loading && <div className="loading-spinner-small" />}
          </div>

          <div className="employees-grid">
            {employees.map((emp) => (
              <div key={emp.id} className="employee-card">
                <div className="employee-info">
                  <div className="employee-avatar">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-details">
                    <h4 className="employee-name">{emp.name}</h4>
                    <div className="employee-meta">
                      <span className="dept-badge">{emp.department}</span>
                      <span className="age-badge">{emp.age} years</span>
                    </div>
                    <div className="employee-salary">
                      ₹{Number(emp.salary).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="employee-actions">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="btn btn-sm btn-warning"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="btn btn-sm btn-danger"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {employees.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <p>No team members yet. Add your first member above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Employees;