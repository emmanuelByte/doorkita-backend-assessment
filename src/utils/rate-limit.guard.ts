import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address as tracker for rate limiting
    const ips = req.ips as string[] | undefined;
    const ip = ips && ips.length > 0 ? ips[0] : (req.ip as string);
    return Promise.resolve(ip || 'unknown');
  }
}
