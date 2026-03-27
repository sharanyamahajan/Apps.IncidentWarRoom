import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IConfigurationExtend } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { AlertWebhookEndpoint } from './src/endpoints/AlertWebhookEndpoint';

export class IncidentWarRoomApp extends App {
    constructor(info: IAppInfo, logger: any, accessors: any) {
        super(info, logger, accessors);
    }

    protected async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new AlertWebhookEndpoint(this)],
        });
    }
}
