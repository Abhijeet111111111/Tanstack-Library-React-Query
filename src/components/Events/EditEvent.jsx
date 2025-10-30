import {Link, useNavigate, useParams} from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import {useMutation, useQuery} from "@tanstack/react-query";
import {fetchEvent, queryClient} from "../../http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import {updateEvent} from "../../http.js";

export default function EditEvent() {
    const navigate = useNavigate();
    const params = useParams();
    const {data, isPending} = useQuery({
        queryKey: ['events', params.id],
        queryFn: ({signal}) => fetchEvent({id: params.id, signal: signal})
    })
    const {mutate} = useMutation({
        mutationKey : ['events',params.id],
        mutationFn: updateEvent,
        onMutate: async (data) => {
            const newEvent = data.event
            await queryClient.cancelQueries({
                queryKey: ['events', params.id],
            })
            const previousEvent = queryClient.getQueryData(['events', params.id])
            queryClient.setQueryData( ['events', params.id], newEvent)
            return {previousEvent}
        },
        onError: (error,data,context) => {
            queryClient.setQueryData(['events',context.previousEvent.id], context.previousEvent)},
        onSettled : () =>{queryClient.invalidateQueries(['events',params.id])}
    })

    function handleSubmit(formData) {
        mutate({id: params.id, event: formData})
        navigate('../')
    }

    function handleClose() {
        navigate('../');
    }

    return (
        <Modal onClose={handleClose}>
            {isPending ? <LoadingIndicator/> : <> <EventForm inputData={data} onSubmit={handleSubmit}>
                <Link to="../" className="button-text">
                    Cancel
                </Link>
                <button type="submit" className="button">
                    Update
                </button>
            </EventForm></>}
        </Modal>
    );
}
