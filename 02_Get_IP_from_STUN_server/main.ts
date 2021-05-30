// https://datatracker.ietf.org/doc/html/rfc5389
// STUN Message Structure
// All STUN messages MUST start with a 20-byte header followed by zero
//    or more Attributes.  The STUN header contains a STUN message type,
//    magic cookie, transaction ID, and message length.

//        0                   1                   2                   3
//        0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//       |0 0|     STUN Message Type     |         Message Length        |
//       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//       |                         Magic Cookie                          |
//       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//       |                                                               |
//       |                     Transaction ID (96 bits)                  |
//       |                                                               |
//       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

//                   Figure 2: Format of STUN Message Header

//    The Message Types can take on the following values:

//       0x0001  :  Binding Request
//       0x0101  :  Binding Response
//       0x0301  :  Binding Error Response

enum MessageType {
    BINDING_REQUEST = 0x0001,
    BINDING_RESPONSE = 0x0101,
    BINDING_ERROR_RESPONSE = 0x0301,
}

interface MessageHeader {
    messageType: MessageType // 2bytes
    length: number // 2bytes
    magicCookie: 0x2112A442 // 4bytes. fixed value 0x2112A442
    transactionID: Uint8Array // 12bytes
}

// 11.2  Message Attributes

//    After the header are 0 or more attributes.  Each attribute is TLV
//    encoded, with a 16 bit type, 16 bit length, and variable value:

//     0                   1                   2                   3
//     0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//    |         Type                  |            Length             |
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//    |                             Value                             ....
//    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

//    The following types are defined:

//    0x0001: MAPPED-ADDRESS
//    0x0002: RESPONSE-ADDRESS
//    0x0003: CHANGE-REQUEST
//    0x0004: SOURCE-ADDRESS
//    0x0005: CHANGED-ADDRESS
//    0x0006: USERNAME
//    0x0007: PASSWORD
//    0x0008: MESSAGE-INTEGRITY
//    0x0009: ERROR-CODE
//    0x000a: UNKNOWN-ATTRIBUTES
//    0x000b: REFLECTED-FROM

enum MessageAttributeType {
    MAPPED_ADDRESS = 0x0001,
    RESPONSE_ADDRESS = 0x0002,
    CHANGE_REQUEST = 0x0003,
    SOURCE_ADDRESS = 0x0004,
    CHANGED_ADDRESS = 0x0005,
    USERNAME = 0x0006,
    PASSWORD = 0x0007,
    MESSAGE_INTEGRITY = 0x0008,
    ERROR_CODE = 0x0009,
    UNKNOWN_ATTRIBUTES = 0x000a,
    REFLECTED_FROM = 0x000b,
}

interface MessageAttribut {
    type: MessageAttributeType // 2bytes
    length: number // 2bytes
    value: Uint8Array // Varies
}

// Message
interface Message {
    header: MessageHeader
    attributes: MessageAttribut[] | null
}


// create request message
const transactionID: Uint8Array = (new TextEncoder()).encode('test01');
console.log(transactionID);

const requestHeader: MessageHeader = {
    messageType: MessageType.BINDING_REQUEST,
    length: 0,
    magicCookie: 0x2112A442,
    transactionID
}

const requestMessage: Message = {
    header: requestHeader,
    attributes: null,
}

function convertMessageToUint8Array(message: Message): Uint8Array {
    // header
    const buffer = new ArrayBuffer(20 + message.header.length);
    const dataView = new DataView(buffer);
    dataView.setUint16(0, message.header.messageType);
    dataView.setUint16(2, message.header.length);
    dataView.setUint32(4, message.header.magicCookie);
    message.header.transactionID.forEach((v, i) => {
        dataView.setUint8(8 + i, v);
    });

    // attributes
    if (message.header.length > 0 && message.attributes !== null) {
        let startIndex = 20;
        message.attributes.forEach((attribute) => {
            // type
            dataView.setUint16(startIndex, attribute.type);
            // length
            dataView.setUint16(startIndex + 2, attribute.length);
            // value
            attribute.value.forEach((v, i) => {
                dataView.setUint8(startIndex + 4 + i, v);
            });
            startIndex += attribute.length;
        });
    }

    return new Uint8Array(buffer);
}

const requestData = convertMessageToUint8Array(requestMessage);

// console.log(requestData);


const listener = Deno.listenDatagram({
    port: 3478,
    transport: 'udp'
});

console.log('send request data..');
const stunServerAddr: Deno.NetAddr = {
    transport: 'udp',
    hostname: 'stun.voip.aebc.com',
    port: 3478
};
await listener.send(requestData, stunServerAddr);

console.log('listening..');
const r = await listener.receive();
console.log('received');
console.log(r);

listener.close();
console.log('closed');