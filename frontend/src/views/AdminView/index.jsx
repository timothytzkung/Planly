
import {AdminSidebar} from "../../components/AdminSidebar"
import { AdminReview } from "../../components/AdminReview"

export const AdminView = () => {


    return(
        <div style={{
            display: "flex"
        }}>
            <AdminSidebar />
            <AdminReview />
        </div>
    )
}