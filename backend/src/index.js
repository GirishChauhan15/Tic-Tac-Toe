import { server } from "./utils/socket.js";

const port = process.env.PORT || 8000

server.on('error', ()=>{
    console.log(`Error while connecting server`)
})
server.listen(port, ()=>{
    console.log(`Port is listening at port: http://localhost:${port}`)
})