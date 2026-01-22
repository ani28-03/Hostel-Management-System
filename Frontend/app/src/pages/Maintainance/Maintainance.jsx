import React, { useEffect, useState } from "react";
import { DashboardServices } from "../DashboardServices";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Maintenance() {
  const [maintenance, setMaintenance] = useState([]);
  const [showForm, setShowForm] = useState(false);
   
   const [form, setForm] = useState({
  main_type: "",
  amount: "",
  main_date: "",
  main_description: "",
  status: "pending"
});

  const loadMaintenance = async () => {
    const data = await DashboardServices.getMaintenance();
    setMaintenance(data);
  };

  useEffect(() => {
    loadMaintenance();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  await DashboardServices.addMaintenance({
  main_type: form.main_type,
  amount: Number(form.amount),
  main_date: form.main_date,
  main_description: form.main_description,
  status: form.status
});


  setForm({
    main_id: "",
    main_type: "",
    amount: "",
    main_date: "",
    main_description: "",
  });

  setShowForm(false);
  loadMaintenance();
};


  const handleDelete = async (id) => {
    if (window.confirm("Delete this maintenance record?")) {
      await DashboardServices.removeMaintenance(id);
      loadMaintenance();
    }
  };

  const [statistics, setStatistics] = useState({
  total: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
  urgent: 0
});

useEffect(() => {
  let pending = 0, inProgress = 0, completed = 0, urgent = 0;

  maintenance.forEach(m => {
    if (m.status === "pending") pending++;
    else if (m.status === "in_progress") inProgress++;
    else if (m.status === "completed") completed++;
    else if (m.status === "urgent") urgent++;
  });

  setStatistics({
    total: maintenance.length,
    pending,
    inProgress,
    completed,
    urgent
  });
}, [maintenance]);


  return (
  <>
    {/* PAGE HEADER */}
    <div className="row">
      <div className="col-md-8">
        <h1>Maintenance</h1>
        <h5>Manage maintenance here</h5>
      </div>

      <div className="col-md-4 text-end">
        <button
          id="maintenance-add-button"
          className="btn btn-primary mt-4"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "Add Maintenance"}
        </button>
      </div>
    </div>

    <hr />

    {/* MAIN CONTAINER */}
    <div id="maintenance-container" className="container">

      {/* DASHBOARD CARDS */}
      <div id="final-cards" className="row mt-4">
        <div className="col-md-3 bg-primary info-card">
          <div className="info-header">Total Maintenance</div>
          <div className="info-value">{statistics.total}</div>
        </div>

        <div className="col-md-3 bg-warning info-card">
          <div className="info-header">Pending</div>
          <div className="info-value">{statistics.pending}</div>
        </div>

        <div className="col-md-3 bg-info info-card">
          <div className="info-header">In Progress</div>
          <div className="info-value">{statistics.inProgress}</div>
        </div>

        <div className="col-md-3 bg-danger info-card">
          <div className="info-header">Urgent</div>
          <div className="info-value">{statistics.urgent}</div>
        </div>
      </div>

      <hr />

      {/* TABLE + FORM ROW */}
      <div className="row">
        {/* TABLE */}
        <div id="maintenance-main-table" className="col-md-10 mt-2">
          <div className="payment-header">
            <h3>Maintenance Records</h3>
            <h5>All maintenance expenses</h5>
          </div>

          <table className="payment-table mt-4">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Status</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {maintenance.map((m) => (
                <tr key={m.main_id}>
                  <td>{m.main_id}</td>
                  <td>{m.main_type}</td>
                  <td>₹{m.amount}</td>
                  <td>{m.main_date}</td>
                  <td>{m.main_description}</td>

                  {/* STATUS */}
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={m.status}
                      onChange={(e) =>
                        DashboardServices
                          .updateMaintenanceStatus(m.main_id, {
                            status: e.target.value
                          })
                          .then(loadMaintenance)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </td>

                  {/* DELETE */}
                  <td>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(m.main_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SIDE FORM */}
        <div
          id="col-form"
          className={`collapse-form ${showForm ? "open" : ""} col-md-2`}
        >
          <h2>Add Maintenance</h2>
          <hr />

          <input
            className="form-control mb-3"
            placeholder="Maintenance Type"
            name="main_type"
            value={form.main_type}
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            placeholder="Amount"
            name="amount"
            value={form.amount}
            onChange={handleChange}
          />

          <input
            type="date"
            className="form-control mb-3"
            name="main_date"
            value={form.main_date}
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            placeholder="Description"
            name="main_description"
            value={form.main_description}
            onChange={handleChange}
          />

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleSubmit}
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  </>
);
}