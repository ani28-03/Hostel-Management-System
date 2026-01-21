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

        await DashboardServices.addComplaint({
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


    const handleUpdate=async(comp)=>{
            if(!window.confirm("Proceed with Update? This will delete Tenant info temporarily!!")){
                return;
            }
    
            setShowForm(true);
    
            setComplaintForm({
                comp_id:comp.comp_id,
                guest_name:comp.guest_name,
                room_no:comp.room_no,
                comp_type:comp.comp_type,
                complaint:comp.complaint,
                comp_date:comp.comp_date,
                is_resolved:comp.is_resolved
            });
    
            await DashboardServices.removeComplaint(comp.comp_id);
            setComplaints((prev)=>prev.filter((p)=>p.comp_id!==comp.comp_id));
            await showComplaints();
        };
    
        const handleResolve = async (comp_id) => {
  if (!window.confirm("Mark this complaint as resolved?")) return;

  await DashboardServices.markResolved(comp_id);
  await showComplaints();
};

      
const [statistics, setStatistics] = useState({
  total: 0,
  resolved: 0,
  pending: 0
});


useEffect(() => {
  if (complaints.length > 0) {
    let total = complaints.length;
    let resolved = 0;
    let pending = 0;

    complaints.forEach(c => {
      if (c.is_resolved) resolved++;
      else pending++;
    });

    setStatistics({
      total,
      resolved,
      pending
    });
  } else {
    setStatistics({ total: 0, resolved: 0, pending: 0 });
  }
}, [complaints]);

    

 return (
  <>
    
    <div className="row">
      <div className="col-md-8">
        <h1>Complaints</h1>
        <h5>Manage complaints here</h5>
      </div>
    </div>

    <hr />

   
    <div id="complaint-container" className="container">

     
      <div id="final-cards" className="row mt-5">

        <div className="col-md-3 bg-primary info-card">
          <div className="info-header">
            <span>Total Complaints</span>
            <FontAwesomeIcon icon={['fas', 'list']} />
          </div>
          <div className="info-value">{statistics.total}</div>
        </div>

        <div className="col-md-3 bg-success info-card">
          <div className="info-header">
            <span>Resolved</span>
            <FontAwesomeIcon icon={['far', 'circle-check']} />
          </div>
          <div className="info-value">{statistics.resolved}</div>
        </div>

        <div className="col-md-3 bg-warning info-card">
          <div className="info-header">
            <span>Pending</span>
            <FontAwesomeIcon icon={['fas', 'clock']} />
          </div>
          <div className="info-value">{statistics.pending}</div>
        </div>

      </div>

      <hr />

      
      <div className="row">
        <div className="col-md-12">
          <div id="complaint-main-table" className="mt-2">

            <div className="payment-header">
              <h3>Complaint Records</h3>
              <h5>All complaints and their resolution status</h5>
            </div>

            <table className="payment-table mt-4">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Complaint</th>
                  <th>Date</th>
                  <th>Resolve</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No complaints found
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.comp_id}>
                      <td>{c.comp_id}</td>
                      <td>{c.guest_name}</td>
                      <td>{c.room_no}</td>
                      <td>{c.comp_type}</td>
                      <td>{c.complaint}</td>
                      <td>{new Date(c.comp_date).toLocaleDateString()}</td>

                      <td>
                        {c.is_resolved ? (
                          <span className="status paid">Resolved</span>
                        ) : (
                          <button
                            className="btn status pending"
                            onClick={() => handleResolve(c.comp_id)}
                          >
                            Mark as Resolved
                          </button>
                        )}
                      </td>

                      <td className="action-btns">
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(c.comp_id)}
                        >
                          <FontAwesomeIcon icon={['far', 'trash-can']} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>
  </>
);
}