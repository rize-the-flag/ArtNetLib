import { z } from 'zod';

export const setChannelsApi = z.object({
  actionName: z.literal('setChannels'),
  parameters: z.object({
    channels: z.array(z.number().min(0).max(255)).max(512).min(1),
  }),
});

export const setChannelApi = z.object({
  actionName: z.literal('setChannel'),
  parameters: z.object({
    channel: z.number().max(512).min(0),
    value: z.number().max(255).min(0),
  }),
});

export const API = z.discriminatedUnion('actionName', [setChannelsApi, setChannelApi]);
