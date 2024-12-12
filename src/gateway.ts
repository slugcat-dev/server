import { type WebSocket } from 'ws'

interface WebSocketClient {
	socket: WebSocket
	alive: boolean
	board: string | null
}

const clients = new Map<WebSocket, WebSocketClient>()

/**
 * Remove clients that haven't sent a heartbeat since the last check.
 */
export function removeDeadClients() {
	clients.forEach((client, socket) => {
		if (!client.alive)
			return socket.terminate()

		client.alive = false
	})
}

/**
 * Handle new gateway connections.
 */
export function onGatewayConnection(socket: WebSocket) {
	const client = {
		socket,
		alive: true,
		board: null
	}

	clients.set(socket, client)

	socket.on('message', message => {
		try {
			handleMessage(client, JSON.parse(message.toString()))
		} catch {}

		client.alive = true
	})

	socket.on('close', () => {
		clients.delete(socket)
	})
}

function handleMessage(client: WebSocketClient, data: any) {
	const { socket } = client

	if (data.type === 'ping')
		return socket.send(JSON.stringify({ type: 'pong' }))
	else if (data.type === 'userJoinBoard')
		return client.board = data.board
	else if (data.type === 'userLeaveBoard')
		return client.board = null

	clients.forEach(client => {
		if (client.socket !== socket && client.board === data.board)
			client.socket.send(JSON.stringify(data))
	})
}
