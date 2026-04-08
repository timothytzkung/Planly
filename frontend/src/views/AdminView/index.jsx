
import {Sidebar} from "../../components/Sidebar"
import { AdminReview } from "../../components/AdminReview"


// Very simple admin view lol
export const AdminView = () => {

    return(
        <div style={{
            display: "flex"
        }}>
            <Sidebar />
            <AdminReview />
        </div>
    )
}