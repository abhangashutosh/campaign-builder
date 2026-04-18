import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server!: Server

  @SubscribeMessage('subscribe_campaign')
  handleSubscribe(@MessageBody() data: { campaignId: string }, @ConnectedSocket() client: Socket) {
    client.join(`campaign:${data.campaignId}`)
    return { event: 'subscribed', data: { campaignId: data.campaignId } }
  }

  emitCampaignProgress(campaignId: string, progress: unknown) {
    this.server.to(`campaign:${campaignId}`).emit('campaign_progress', progress)
  }
}
