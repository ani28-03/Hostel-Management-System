import React,{useEffect,useState} from "react";
import { DashboardServices } from '../DashboardServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Payments.css';

export default function Payments(){

    const [payments, setPayments] = useState([]);

    const [today, setToday] = useState("");     //calculate curr date to compare if pending/overdue 
    const dateTime = new Date().toISOString().slice(0, 19).replace("T", " ");   //Calculate todays date and time
    
    const [showReceipt, setShowReceipt] = useState(false);  //For receipt
    const [selectedPayment, setSelectedPayment] = useState(null);

    const [showForm, setShowForm] = useState(false); //to toggle add form
    const [statistics, setStatistics] = useState({ //count revenue
            totalAmount:0,
            PaidAmount:0,
            pendingAmount:0,
            overdueAmound:0
        });
    const [paymentForm, setPaymentForm] = useState({
        payment_id:"",
        room_no:"",
        type:"",
        amount:"",
        due_date:"",
        isPaid:0
    });

    useEffect(() => {
      showPayments();
    }, []);

    // To calculate total revenue:-paid/pending/Overdue 
    useEffect(() => {       
        const todayDate = new Date().toISOString().split("T")[0];
        setToday(todayDate);

        if (payments.length > 0) {
            let total = 0;
            let paid = 0;
            let pending = 0;
            let overdue = 0;

            payments.forEach(p => {
                total += Number(p.amount);

                if (p.isPaid) {
                    paid += Number(p.amount);
                } 
                else {
                    if (p.due_date < todayDate) {
                        overdue += Number(p.amount);
                    } else {
                        pending += Number(p.amount);
                    }
                }
            });

            setStatistics({
                totalAmount: total,
                PaidAmount: paid,
                pendingAmount: pending,
                overdueAmound: overdue
            });
        }
    }, [payments]);


    const showPayments=async()=>{
        const data = await DashboardServices.getPayment();
        // console.log(data);
        setPayments(data);
    }; 

    const handleChange=async(event)=>{
        setPaymentForm({...paymentForm,[event.target.name]:event.target.value});
    };

    const handleAdd=async()=>{
        const {room_no,type,amount,due_date,isPaid} = paymentForm;
        if(!room_no||!type||!amount||!due_date){
            alert("Please fill all fields!!!");
            return;
        }

        await DashboardServices.addPayment(paymentForm);  
        await showPayments();
        setPaymentForm({
            payment_id:"",
            room_no:"",
            type:"",
            amount:"",
            due_date:"",
            isPaid:0
        });

        setShowForm(false);
    };

    const handleDelete=async(payment_id)=>{
        if(!window.confirm("Proceed with Delete?")){
            return;
        }

        await DashboardServices.removePayment(payment_id);
        alert("Payment Deleted!!!")
        setPayments((prev)=>prev.filter((p)=>p.payment_id!==payment_id));
        await showPayments();
    };

    const handleUpdate=async(payment)=>{
        if(!window.confirm("Proceed with Update? This will delete Tenant info temporarily!!")){
            return;
        }

        setShowForm(true);

        setPaymentForm({
            payment_id:payment.payment_id,
            room_no:payment.room_no,
            type:payment.type,
            amount:payment.amount,
            due_date:payment.due_date,
            isPaid:payment.isPaid
        });

        await DashboardServices.removePayment(payment.payment_id);
        setPayments((prev)=>prev.filter((p)=>p.payment_id!==payment.payment_id));
        await showPayments();
    };

    const handlePaid = async(payment_id)=>{
        await DashboardServices.changePaid(payment_id,{ paid_date: dateTime });
        // await DashboardServices.changePaid_date(payment_id,dateTime);
            console.log(dateTime);

        await showPayments();
    };

    const openReceipt = (payment) => {
        setSelectedPayment(payment);
        setShowReceipt(true);
    };

    return(
        <>
        <div className="row">
            <div className="col-md-8">
            <h1>Payments</h1>
            <h5>Manage payments payments here</h5>
            </div>
            {/* Add button to hide/seek form  */}
            <div className="col-md-2">
                <button id="payment-add-button" 
                    className="btn btn-primary mb-3"
                    onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Close Form" : "Add Payment"}
                </button>
            </div>
        </div><hr/>
        <div id="payment-container" className="container">
            <div id="final-cards" className="row mt-5">

                <div className="col-md-3 bg-primary info-card">
                    <div className="info-header">
                        <span>Total Amount</span>
                        <FontAwesomeIcon icon={['fas', 'dollar-sign']} />
                    </div>

                    <div className="info-value">₹ {statistics.totalAmount}</div>
                </div>

                <div className="col-md-3 bg-success info-card">
                    <div className="info-header">
                        <span>Paid</span>
                        <FontAwesomeIcon icon={['far', 'circle-check']} />
                    </div>

                    <div className="info-value">₹ {statistics.PaidAmount}</div>
                </div>

                <div className="col-md-3 bg-warning info-card">
                    <div className="info-header">
                        <span>Pending</span>
                        <FontAwesomeIcon icon={['fas', 'clock']} />
                    </div>

                    <div className="info-value">₹ {statistics.pendingAmount}</div>
                </div>

                <div className="col-md-3 bg-danger info-card">
                    <div className="info-header">
                        <span>Overdue</span>
                        <FontAwesomeIcon icon={['fas', 'circle-exclamation']} />
                    </div>

                    <div className="info-value">₹ {statistics.overdueAmound}</div>
                </div>
            </div>
            <hr/>
            <div className="row">
                <div className='col-md-12'>
                    <div className='row'>
                        <div id="payment-main-table" className="col-md-12 mt-2">
                            <div className="payment-header">
                                        <h3>Payment Records</h3>
                                        <h5>All payment transactions and their status</h5>
                            </div>

                            <table className="payment-table mt-4">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tenant</th>
                                        <th>Room</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                        <th> Edit | Delete</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {payments.map(payment => (
                                        <tr key={payment.payment_id}>
                                            <td>{payment.payment_id}</td>
                                            <td>{payment.guest_name}</td>
                                            <td>{payment.room_no}</td>
                                            <td>{payment.type}</td>
                                            <td>₹{payment.amount}</td>
                                            <td>{payment.due_date}</td>

                                            <td>
                                                {payment.isPaid ? (
                                                    <span className="status paid">Paid</span>
                                                ) : (
                                                    (payment.due_date>today)?(
                                                    <span className="status pending">Pending</span>
                                                ):(
                                                    <span className="status overdue">Overdue</span>
                                                ))}
                                            </td>

                                            <td className="action-btns">
                                                {payment.isPaid ? (
                                                    <button className="btn btn-receipt" onClick={() => { setSelectedPayment(payment); setShowReceipt(true); }}>Receipt</button>
                                                ) : (
                                                    <button className="btn btn-paid" onClick={()=> handlePaid(payment.payment_id)}>Mark Paid</button>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-edit me-3"
                                                    onClick={() => handleUpdate(payment)}
                                                >
                                                    <FontAwesomeIcon icon={['far', 'pen-to-square']} />
                                                </button>

                                                <button
                                                    className="btn btn-delete"
                                                    onClick={() => handleDelete(payment.payment_id)}
                                                >
                                                    <FontAwesomeIcon icon={['far', 'trash-can']} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div id='col-form' className={`collapse-form ${showForm ? "open" : ""} col-md-2`}>
                            <h2>Record Payment</h2><hr/>

                            <input className='form-control mb-3' placeholder='Payment Id'
                                name='payment_id' value={paymentForm.payment_id} onChange={handleChange}/>

                            <input className='form-control mb-3' placeholder='Room No'
                                name='room_no' value={paymentForm.room_no} onChange={handleChange}/>

                            <select className='form-control mb-3' name='type'
                                value={paymentForm.type} onChange={handleChange}>
                                <option value="">-- Select Type --</option>
                                <option value="rent">Rent</option>
                                <option value="deposit">Deposit</option>
                                <option value="electricity">Electricity</option>
                            </select>

                            <input className='form-control mb-3' placeholder='Amount'
                                name='amount' value={paymentForm.amount} onChange={handleChange}/>

                            <input type="date" className='form-control mb-3'
                                name='due_date' value={paymentForm.due_date} onChange={handleChange}/>

                            <button className='btn btn-danger btn-sm' onClick={handleAdd}>ADD</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* payment receipt  */}
        {selectedPayment && (
        <div className={`receipt-backdrop ${showReceipt ? "show" : ""}`} onClick={() => {
                setShowReceipt(false);
                setSelectedPayment(null);       {/*closes modal when clicked outside*/}
            }}>
            <div className="receipt-modal" onClick={(e) => e.stopPropagation()}> {/*stays open for clicks in the modal*/}

                <div className="receipt-card">
                    {/* header */}
                    <div className="receipt-header">
                        <h2>🏨 CDAC HOSTEL </h2>
                        <p>Payment Receipt</p>
                        <hr/>
                    </div>

                    {/* all the details */}
                    <div className="receipt-body">

                        <div className="row-detail">
                            <span><b>Receipt No:</b></span>
                            <span>{selectedPayment.payment_id}</span>
                        </div>

                        <div className="row-detail">
                            <span><b>Tenant Name:</b></span>
                            <span>{selectedPayment.guest_name}</span>
                        </div>

                        <div className="row-detail">
                            <span><b>Room No:</b></span>
                            <span>{selectedPayment.room_no}</span>
                        </div>

                        <div className="row-detail">
                            <span><b>Payment Type:</b></span>
                            <span>{selectedPayment.type.toUpperCase()}</span>
                        </div>

                        <div className="row-detail">
                            <span><b>Due Date:</b></span>
                            <span>{selectedPayment.due_date}</span>
                        </div>

                        <div className="row-detail">
                            <span><b>Paid Date:</b></span>
                            <span>{selectedPayment.paid_date}</span>
                        </div>

                        <hr/>

                        {/* bill table */}
                        <table className="receipt-table">
                            <thead>
                            <tr>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>{selectedPayment.type.toUpperCase()}</td>
                                <td>₹{selectedPayment.amount}</td>
                            </tr>
                            </tbody>
                        </table>

                        <hr/>

                        <div className="row-detail total-row">
                            <span><b>Total Amount:</b></span>
                            <span><b>₹{selectedPayment.amount}</b></span>
                        </div>

                        <div className="footer-note">
                            Thank you for your payment!
                            <br/>CDAC HOSTEL
                        </div>
                    </div>

                    {/* footer buttons */}
                    <div className="receipt-actions">
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => {
                                setShowReceipt(false);
                                setSelectedPayment(null);}}>
                            Close
                        </button>
                        <button className="btn btn-primary"  onClick={() => window.print()}>
                            Download PDF
                        </button>
                    </div>

                </div>
            </div>
        </div>
        )}

        </>
    )
}