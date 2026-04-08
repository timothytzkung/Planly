
import {Sidebar} from "../../components/Sidebar"
import { AdminReview } from "../../components/AdminReview"

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