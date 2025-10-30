import {Link, Outlet, useNavigate} from 'react-router-dom';

import Header from '../Header.jsx';
import {useMutation, useQuery} from "@tanstack/react-query";
import {deleteEvent} from "../../http.js";
import {useParams} from "react-router-dom";
import {queryClient} from "../../http.js";
import {fetchEvent} from "../../http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import {useState} from "react";
import Modal from "../UI/Modal.jsx";


export default function EventDetails() {
    const params = useParams();
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);
    const {mutate, isPending: isPendingDeletion, isError: isDeletionError, error: deleteError} = useMutation({
        mutationFn: deleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['events'], refetchType: 'none'})

            navigate('/events')
        }
    })
    const {data, isPending: isDetailPending, isError, error} = useQuery({
        queryKey: ['events', params.id],
        queryFn: ({signal}) => fetchEvent({id: params.id, signal: signal})

    })

    function handleStartDeletion() {
        setIsDeleting(true);
    }

    function handleDelete() {
        mutate({id: params.id});

    }

    function handleStopDeletion() {
        setIsDeleting(false);
    }

    let content;
    if (isDetailPending) {
        content = <div className="form-actions">
            fetching data ...
        </div>
    }
    if (isError) {
        content = <ErrorBlock title="Error Occurred!"
                              message={error.info?.message || 'could not fetch data try again later...'}/>
    }
    if (data) {
        content = (<>
                {isDeleting && <Modal onClose={handleStopDeletion}>
                    {isDeletionError ? <>
                        <ErrorBlock title="An Error Occured" message={deleteError.info?.message || 'failed to delete... try again later...'}  />
                        <div className="form-actions"><Link to='../' className="button-text">Okay</Link></div>

                    </> : <><h1>Are You Sure?</h1>
                        <p>deletion can not be undone.</p>
                        <div className="form-actions">
                            {!isPendingDeletion ? <>
                                    <button className="button-text" onClick={handleStopDeletion}>Cancel</button>
                                    <button className="button" onClick={handleDelete}>delete
                                    </button>
                                </> :
                                <p>Deleting ...</p>
                            }
                        </div>
                    </>}
                </Modal>
                }
                <article id="event-details">
                    <header>
                        <h1>{data.title}</h1>
                        <nav>
                            <button onClick={handleStartDeletion}>delete</button>
                            <Link to="edit">Edit</Link>
                        </nav>
                    </header>
                    <div id="event-details-content">
                        <img src={`http://localhost:3000/${data.image}`} alt="image"/>
                        <div id="event-details-info">
                            <div>
                                <p id="event-details-location">{data.location}</p>
                                <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} @ {data.time}</time>
                            </div>
                            <p id="event-details-description">{data.description}</p>
                        </div>
                    </div>
                </article>
            </>
        )
    }

    return (
        <>
            <Outlet/>
            <Header>
                <Link to="/events" className="nav-item">
                    View all Events
                </Link>
            </Header>
            {content}
        </>
    );
}
