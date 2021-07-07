import { startDev } from './dev-server.ts';

if (Deno.args[0] == '-y') {
  startDev();
} else {
  const res = prompt('start the server?:');

  if (res?.startsWith('y')) {
    startDev();
  }
}
