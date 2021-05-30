// deno run --unstable --allow-net ./01_DNS_lookup/main.ts

const addrs = await Deno.resolveDns('localhost', 'A')
console.log(addrs);

const addrs2 = await Deno.resolveDns('seed.bitcoin.sipa.be', 'A');
console.log(addrs2);

const addrs3 = await Deno.resolveDns('seed.bitcoin.sipa.be', 'AAAA');
console.log(addrs3);