import React,{useEffect,useState} from "react";
import { DashboardServices } from '../DashboardServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Complaints() {

    const [complaints, setComplaints] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [complaintForm, setComplaintForm] = useState({
        comp_id: "",
        guest_name: "",
        room_no: "",
        comp_type: "",
        complaint: "",
        comp_date: "",
        is_resolved: 0
    });

    useEffect(() => {
        showComplaints();
    }, []);

    const showComplaints = async () => {
        const data = await DashboardServices.getComplaints();
        setComplaints(data);
    };


    const handleChange = (e) => {
        setComplaintForm({
            ...complaintForm,
            [e.target.name]: e.target.value
        });
    };

    
    const handleAdd = async () => {
        const { guest_name, room_no, comp_type, complaint } = complaintForm;

        if (!guest_name || !room_no || !comp_type || !complaint) {
            alert("Please fill all fields");
            return;
        }

        await DashboardServices.addComplaints({
            ...complaintForm,
            comp_date: new Date().toISOString().split("T")[0],
            is_resolved: 0
        });

        await showComplaints();

        setComplaintForm({
            comp_id: "",
            guest_name: "",
            room_no: "",
            comp_type: "",
            complaint: "",
            comp_date: "",
            is_resolved: 0
        });

        setShowForm(false);
    };

    
    const handleDelete = async (comp_id) => {
        if (!window.confirm("Delete this complaint?")) return;

        await DashboardServices.removeComplaint(comp_id);
        await showComplaints();
    };

    

   return (
  <>
    <div className="container">

      {/* HEADER */}
      <div className="row align-items-center">
        <div className="col-md-8">
          <h1>Complaints</h1>
          <h5>Manage complaints here</h5>
        </div>

        <div className="col-md-4 text-end">
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close Form" : "Add Complaint"}
          </button>
        </div>
      </div>

      <hr />

      {/* COMPLAINTS TABLE */}
      <table className="table table-bordered table-striped mt-4">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Guest</th>
            <th>Room</th>
            <th>Type</th>
            <th>Complaint</th>
            <th>Date</th>
            <th>Status</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {complaints.map(c => (
            <tr key={c.comp_id}>
              <td>{c.comp_id}</td>
              <td>{c.guest_name}</td>
              <td>{c.room_no}</td>
              <td>{c.comp_type}</td>
              <td>{c.complaint}</td>
              <td>{new Date(c.comp_date).toLocaleDateString()}</td>
              <td>
                {c.is_resolved ? (
                  <span className="badge bg-success">Resolved</span>
                ) : (
                  <span className="badge bg-warning text-dark">Pending</span>
                )}
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(c.comp_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD COMPLAINT FORM */}
      {showForm && (
        <div className="card mt-4 p-4">
          <h3>Add Complaint</h3>

          <input
            className="form-control mb-2"
            placeholder="Guest Name"
            name="guest_name"
            value={complaintForm.guest_name}
            onChange={handleChange}
          />

          <input
            className="form-control mb-2"
            placeholder="Room No"
            name="room_no"
            value={complaintForm.room_no}
            onChange={handleChange}
          />

          <select
            className="form-control mb-2"
            name="comp_type"
            value={complaintForm.comp_type}
            onChange={handleChange}
          >
            <option value="">-- Select Type --</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Other">Other</option>
          </select>

          <textarea
            className="form-control mb-3"
            placeholder="Complaint Description"
            name="complaint"
            value={complaintForm.complaint}
            onChange={handleChange}
          />

          <button className="btn btn-success" onClick={handleAdd}>
            Submit Complaint
          </button>
        </div>
      )}

    </div>
  </>
);
}