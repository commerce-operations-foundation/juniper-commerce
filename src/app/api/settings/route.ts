import { NextRequest, NextResponse } from 'next/server';
import { getConfig, saveConfig, isInstallMode, stripSecrets } from '@/lib/config';

export async function GET() {
  const config = getConfig();
  return NextResponse.json({ config: stripSecrets(config), installMode: isInstallMode() });
}

export async function POST(req: NextRequest) {
  if (!isInstallMode()) {
    return NextResponse.json({ error: 'Settings are only editable in install mode (APP_MODE=full)' }, { status: 403 });
  }

  const body = await req.json();
  const updated = saveConfig(body);
  return NextResponse.json({ config: stripSecrets(updated), success: true });
}
