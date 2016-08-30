# IPC messagaing conforms to IPython Messaging protocol

*https://ipython.org/ipython-doc/3/development/messaging.html#general-message-format*


`Renderer <-> Main <-> JupyterClient`

# Message types

1. Shell ROUTER/DEALER
> this single ROUTER socket allows multiple incoming connections from frontends, and this is the socket where requests for code execution, object information, prompts, etc. are made to the kernel by any frontend. The communication on this socket is a sequence of request/reply actions from each frontend and the kernel.

2. PUB/SUB
> The ‘broadcast channel’ where the kernel publishes all side effects (stdout, stderr, etc.) as well as the requests coming from any client over the shell socket and its own requests on the stdin socket. There are a number of actions in Python which generate side effects: print() writes to sys.stdout, errors generate tracebacks, etc. Additionally, in a multi-client scenario, we want all frontends to be able to know what each other has sent to the kernel (this can be useful in collaborative scenarios, for example). This socket allows both side effects and the information about communications taking place with one client over the shell channel to be made available to all clients in a uniform manner.

3. Stdin ROUTER/DEALER (originates from kernel)
> ROUTER socket is connected to all frontends, and it allows the kernel to request input from the active frontend when raw_input() is called. The frontend that executed the code has a DEALER socket that acts as a ‘virtual keyboard’ for the kernel while this communication is happening (illustrated in the figure by the black outline around the central keyboard). In practice, frontends may display such kernel requests using a special input widget or otherwise indicating that the user is to type input for the kernel instead of normal commands in the frontend.

4. Heartbeat
5. Custom messages

# Messages

### Shell ROUTER/DEALER

- execute_request
- inspect_request
- complete_request
- history_request
- is_complete_request
- kernel_info_request
- connect_request
- shutdown_request

### IOPUB

- stream
- display_data
- data_pub
- execute_input
- execute_result
- error
- status
- clear_output


### Stdin ROUTER/DEALER

- input_request
- input_reply

### Heartbeat

> Clients send ping messages on a REQ socket, which are echoed right back from the Kernel’s REP socket. These are simple bytestrings, not full JSON messages described above.

### Custom

- comm_open
- comm_msg
- comm_close

### Additional Messages

- getVariables
- interrupt?

