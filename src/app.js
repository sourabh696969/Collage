import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORINGIN,
    credentials: true
}))

app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())


// routes import
import  AdminRouter  from './routes/Admin/admin_routes.js'
import blogRouter from './routes/blog_routes.js'
import videoRouter from './routes/video_routes.js'
import gelleryRouter from './routes/gallery_router.js'
import aboutRouter from './routes/about_routes.js'
import pressrealseRouter from './routes/press_routes.js'
import studentRoute from './routes/student_routes.js'
import ficilitiesRoute from './routes/ficilities_routes.js'
import medicalficilitiesRoute from './routes/medical_ficilities_routes.js'
import acedamicRoute from './routes/academic_routes.js'
import departmentRoute from './routes/department_routes.js'
// import contactRoute from './routes/contact.js'

// routes declaration
app.use('/api/v1/admin', AdminRouter)
app.use('/api/v1/blogs', blogRouter)
app.use('/api/v1/video', videoRouter)
app.use('/api/v1/gellery', gelleryRouter)
app.use('/api/v1/aboutus', aboutRouter)
app.use('/api/v1/pressrealse', pressrealseRouter)
app.use('/api/v1/student', studentRoute)
app.use('/api/v1/ficilities', ficilitiesRoute)
app.use('/api/v1/medicalficilities', medicalficilitiesRoute)
app.use('/api/v1/acedamic', acedamicRoute)
app.use('/api/v1/department', departmentRoute)
// app.use('/api/v1/contact', contactRoute)
export { app }