import { ApiEndpoint } from '@rocket.chat/apps-engine/definition/api';

export class AlertWebhookEndpoint extends ApiEndpoint {
    public path = 'alert';

    public async post(request, endpoint, read, modify) {
        const payload = request.content;
        
        // Create the war room channel
        const roomBuilder = modify.getCreator().startRoom()
            .setType('c')
            .setSlugifiedName(`incident-${Date.now()}`)
            .setDisplayName(`Incident: ${payload.title || 'Alert Received'}`);
        
        const roomId = await modify.getCreator().finish(roomBuilder);
        
        // Post the alert in the channel
        const msgBuilder = modify.getCreator().startMessage()
            .setRoom({ id: roomId, slugifiedName: '', type: 'c', value: '' } as any)
            .setText(`🚨 *INCIDENT DECLARED*\n\n${payload.title}\n${payload.description || 'No description provided'}`);
        
        await modify.getCreator().finish(msgBuilder);
        
        return this.success({ roomId });
    }
}