import {
    ApiEndpoint,
    IApiEndpointInfo,
    IApiRequest,
    IApiResponse,
} from '@rocket.chat/apps-engine/definition/api';
import {
    IRead,
    IModify,
    IHttp,
    IPersistence,
} from '@rocket.chat/apps-engine/definition/accessors';
import { RoomType } from '@rocket.chat/apps-engine/definition/rooms';

export class AlertWebhookEndpoint extends ApiEndpoint {
    public path = 'alert';

    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IApiResponse> {
        const payload = request.content as Record<string, string>;

        const title   = payload.title       || 'Unknown Incident';
        const service = payload.service     || 'unknown-service';
        const severity = payload.severity   || 'P2';

        // Create the war room channel
        const channelName = `incident-${service}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        const roomBuilder = modify.getCreator().startRoom()
            .setType(RoomType.CHANNEL)
            .setSlugifiedName(channelName)
            .setDisplayName(`[${severity}] ${title}`)
            .setTopic(`Incident War Room — ${service} — ${new Date().toISOString()}`);

        const roomId = await modify.getCreator().finish(roomBuilder);

        // Post the initial context brief
        const messageBuilder = modify.getCreator().startMessage()
            .setRoom({ id: roomId } as any)
            .setText(
                `🚨 *INCIDENT DECLARED — ${severity}*\n\n` +
                `*Service:* ${service}\n` +
                `*Summary:* ${title}\n` +
                `*Time:* ${new Date().toUTCString()}\n\n` +
                `_Assembling response team..._`
            );

        await modify.getCreator().finish(messageBuilder);

        return this.success({ status: 'war_room_created', roomId, channelName });
    }
}
