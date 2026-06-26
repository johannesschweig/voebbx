// https://www.voebb.de/aDISWeb/app/prod00?sp=SAK<id>
export function getPermanentUrlFromId(id: string): string {
  return `https://www.voebb.de/aDISWeb/app/prod00?sp=SAK${id}`;
}