# Supply chain tracing based on distributed ledger technology

## Abstract
Nowadays, consumers are more aware and concern about the origin of their products more than ever before. Yet, in the current complex and globalized supply chain, it is extremely difficult to track down the origin and lifetime of products. Challenges include infrastructure, privacy, transparency and trust. Fortunately, the rise of distributed ledger technology such as blockchain may provide a solution to these problems. This project aims to introduce a demo for a novel standard / protocol / platform  that can be used by anyone for general supply chain tracing.

## Introduction to traceability
### Challenges
Ogena G and Ravesteijn P [1] identified a few major obstacles to whole chain traceability : labeling, third-party certification (TPC) fraud, transparency issues, lack of requirement for data sharing, interoperability and confidentiality.

There are many organic labels available in the market [2], which along with poor consumer knowledge leads to misunderstanding of the actual meaning of the certificates. Secondly, in the complex and growing market and supply chain, fraud where unqualified products are sold as one may occur to inexperienced stakeholders [3]. Moreover, even though certified operators are required to keep certain records by regulation, they are not compelled to share these information to their partners, making the process much more trust-reliant [1]. Furthermore, difference in infrastructure or data models also makes it difficult to transfer data from one node to another. Finally, participants are sometimes unwilling to share information to their customers due to fear of losing competitive advantage [1]. 

### Traceable Resource Unit (TRU)
[4] Coins the term TRU as a unique unit in terms of traceability. A product may undergo different TRU changes throughout its lifecycle. It may be split into smaller TRUs, or different TRUs may be combined into 1, or simply just a conversion from 1 unit to another. Thus, a whole chain traceability solution needs to be able to handle different types of TRUs as well as keeping a record of their transition. 

### Core entities
[4] describe core entities as "what can be individually described and considered" and classify them into 2 categories: products and activities. The later refers to step in the route of the product, including any processing step that will influence the quality of the product. An ideal traceability system needs to provide tracing capability to both of these elements.

## Distributed ledger technology (DLT)
### Overview
A distributed ledger (DL) is a shared database that is shared and synced across multiple untrusted machine [5]. Any changes made to the database will be reflected to all nodes after a period of time. The synchronized and distributed nature of distribute ledger technology makes it ideal to solve the supply chain traceability problem as it enables different participants to share the same data model and business logic. There are 2 prominent free and open-source algorithms for DLT, namely blockchain and directed acyclic graph. In addition, due to the sensitive nature of supply chain, the DLT needs to provide permission and private-chain capability, where data is stored secretly and independently between chains and different chains are capable of communicating with each other through smart contracts. The smart contract must be run by only a selected group of nodes to avoid attackers joining and eavesdropping into the communication between the client and the node. Moreover, the DLT must also be scalable to thousands, over even hundreds of thoundsands, of transactions per seconds [6], with little to no cost overhead.

### Blockchain
Blockchain, as the name implies, records every transaction one after another as a chain and protects it from modification by a cryptographic hash. There are multiple implementation available: Hyperledger, Ethereum Proof Of Authority, Quorum, Multichain and Corda [7]. Based on the findings by [7] and taking into consideration the design concerns noted above, Hyperledger becomes the most suitable implementation.

### Directed Acyclic Graph (DAG)
Instead of recording transactions one after another as in blockchain, DAG lets multiple nodes be able to reference to the same parent. This allows much better performance, scalability and security than traditional blockchain. There are currently only a few pioneering projects, but the most promising one is IOTA. Unfortunately, at the time of this writing, the project is still under development and has yet to be proven in the real world.

## SigGraph framework
### Overview
The SigGraph framework aims to solve the supply chain traceability problem using DLT. Each product is represented by a corresponding digital twin on the DL, and every step of its life cycle is recorded down as a chain. Other information related to the products such as certificate, processing or activity can also be attached to the product to allow the clients to verify that the product meets the required standard. The framework prevents fraudulent activities by ensuring the quantity of a product is conserved across multiple participants, and any products, certificate, process or measurements can be validated to have come from the required source.

The project is made up of 3 dimensions: the smart contract framework, the asset-transfer protocol and the client protocol. I'll only describe the overview of each of these dimensions in this repo. The detail implementation description can be found in their respective implementation repo.

### Smart contract framework
#### Partitioning
The DLT must be able to be partitioned into multiple graphs. This is because multiple graphs have different requirements about performance, security and industries may not want their data to be uncontrollably public to the outside world. Thus the underlying DLT technology needs to facilitate the capability for cross graph communication. 

Each graph is identified by a unique name with the following format: `sgp://${DltTechnology}://${BootstrapNodes}:${GraphName}`. The DltTechnology describes the underlying DLT technology of the graph, which can either be hyper (hyperledger) or iota. The BootstrapNodes is a semicolon-seperated list of url that can be used to establish peer discovery. GraphName is the unique graph name among the bootstrap nodes.

The bootstrap nodes will need to return the approriate parameters for the corresponding DLT technology for connection establishment.

#### Smart contract 
##### Node
###### Data structure
The smart contract forms a graph of nodes. Each node is a json object with the following fields: Id string, GraphName string, PublicParentsIds map[string]bool, PublicChildrenIds map[string]bool, PrivateParentsHashedIds map[string]bool, PrivateChildrenHashedIds map[string]bool, IsFinalized bool, Type string, CreatedTime uint64, UpdatedTime uint64, Signature string and OwnerPublicKey string where the Id field is used as the primary key index. 

The Id field is to be supplied by the client when the node is created and needs to be unique.

The GraphName is the unique chain name described in the section above and is set automatically by the graph during node creation.

The PublicParentsIds and PublicChildrenIds contain the ids of the parents and children node, respectively. 

On the other hand, the PrivateParentsHashedIds and PrivateChildrenHashedIds contain the hash of the Id field and a secret component not recorded on the graph according to the following formula: hashedId = sha512(`${publicId}${secret}`). This allows a connection between 2 nodes to remain private, even in the case where the ledger is leaked to an outsider. For security reason, the secret component needs to be at least 10 character long, else the edge creation process will fail. This private connection is still vulnerable to an eavesdropping attack where the attacker secretly records the connection when it is first established. When creating an edge between 2 nodes, if the secret component has length 0, the corresponding side is assumed to be public.

In order for an edge to be valid, both the parent and child must contain reference to ech other because both the owners need to agree with each other about their connection. 

The IsFinalized field indicates that a node is finalized and can no longer be modified. This also means that it can no longer reference or be referenced by a new node.

The Type field stores the type of the node and should be one of the following values: "asset", "certficate_authority", "certificate", "info", "process" and "measurement".

The CreatedTime field stores the unix timestamp of the node creation time. When a new node is created, this field will be compared with the current server's timestamp. If it exceeds 300 seconds, the transaction will be rejected.

The UpdatedTime field stores the unix timestamp of the node update time. When a new node is modified, this field will be compared with the current server's timestamp. If it exceeds 300 seconds, the transaction will be rejected. This field is used to avoid replay attack since now every new state of the node requires a unique hash.

OwnerPublicKey is the public key of the owner of this node. The public key follows PKCS1 standard and is stored in PEM unecrypted format. The signature is generated by using the RSA algorithm by signing the entire content of the node minus the OwnerPublicKey field.

Signature is the signature of the entire node (with fields of child objects as well), minus the Signature field.

Because of the optional secret nature of the edges between node, the owner of a node can selectively share any edges between the nodes that they know about off-chain, or can choose to publish any public information about the node. This capability is the foundation of the power SigGraph: the participants can selectively share information with their customers without leaking sensitive data, and the customer can know the origin of any claims / assets provided by the supplier, which also translates to knowing the authenticity of the information. The bidirectional nature of the edges also allow for possible tracking capabilities, although this is harder to achieve since all the later nodes need to publicly publish its subsequent connections.

Since ownership is determined solely by public-private key pair, participants are completely anonymous. Thus, information can freely be shared between participants without having to worry about leaking sensitive information such as email, contact number, etc.

#### Asset
##### Data structure
An Asset is a json object extending from the Node structure, with the following additional fields: CreationProcess string, Unit string, Quantity string, MaterialName string. 

The CreationProcess field describes how this node is created and  must be one of the following values: "produce", "split", "merge", "transfer" or "unit_change". This allows the client application to know the different lifecycle that the product underwent and also serves as a destination for origin verification in an otherwise possibly infinite chain (the client will usually verify until the point where this field is "produced").

The Unit field describes the unit of the asset. The string can take any value, as there are many possible units for different use cases. However, it must be lowercase and contain only letters and the "_" character. This field can only be set in asset creation, fusion or unit change operation. 

The Quantity field is a decimal value for the quantity of the asset. It must use "." character as the decimal seperator. The value will be conserved during asset transfer, merge and split operation and can only be set in asset creation or unit change operation. 

The MaterialName is the name of the material.

##### Asset creation
Applications can create a new asset by invoking the smart contract CreateAsset(NodeId string, Unit string, Quantity String, MaterialName string, OwnerPublicKey string, CreatedTime uint64, Signature string, MaterialIds []string, MaterialSecretIds []string, SecretIds []string, MaterialSignatures []string). The new asset will be created with the CreationProcess field set to "produce". The materials are assumed to belong to the same owner and will be finalized after this transaction

##### Asset transfer
An asset can be transferred to another owner by calling TransferAsset(NodeId string, NewNodeId string, NewOwnerPublicKey string, Signature string, NewNodeSignature string, TransferTime uint64, NewSecretId string, CurrentSecretId string). This function will create another node copied from the current node with the NewNodeId and NewOwnerPublicKey. The new node will be the child of the current node. If NewSecretId or CurrentSecretId is an empty string, the reference will be public for the correponsding side. Otherwise, the hashedId wil be used. The current asset will be finalized and can no longer be modified. The CreationProcess field of the new node will be set to "produce".

The process of initiating and accepting an asset transfer along with data/history associated is quite complicated and will be described in the application section.

This operation can also be used to mark a step in the life cycle of the asset.

##### Asset split
An asset may be split into multiple smaller units, such as 1 asset of quantity 10 bags can be split into  assets of quantity 2, 3 and 5 bags. This can be done by calling SplitAsset(TransferTime uint64, NodeId string, CurrentSecretIds []string, CurrentNodeSignature string, NewNodeIds []string, NewSecretIds []string, NewNodeQuantities []string, NewNodeSignatures []string). The sum of new node quantities must be equal to the sum of the current node's quantity. The current node will be finalized after this operation. The CreationProcess field of the new nodes will be set to "split".

##### Asset merge
Similar to asset split, assets can also be merged by calling MergeAssets(). This has the inverse effect of asset split. The CreationProcess field of the new node will be set to "merge".

##### Unit change
Assets may be represented by different assets, for example 10 bags of rice can be equal to 10kg of rice. This can be achieved by calling UnitChange(Time uint64, NodeId string, NodeSecretId string, Signature string, NewNodeId string, NewNodeSecretId, NewNodeSignature string, NewQuantity string, NewUnit string). However, unlike transfer, split or merge operations, there is no way to ensure that the quantity is conserved, since the application does not what the correct conversion rate is for all possible units. Thus, this operation poses an exploitable weakness: malicious nodes can arbitrarily modify the quantity by changing the unit. Therefore, clients are and should be restrictive about this operation during verification. Consequently, participants should be careful when using this operation so as not to fail the client-side verification. The CreationProcess field of the new node will be set to "unit_change".

#### Certficate 
##### Data structure
A Certificate is a json object extending from the Node structure, with the following additional fields: ValidFrom uint64, ValidTo uint64, Scope string. A Certificate Authority is just a Node object with type "certificate_authority" and is used to represent a real-world certificate authority.

The ValidFrom and ValidTo describes the start and end unix time of the certificate token. 

The Scope string is the C-style if clause and is used by the client to verify that the asset is within the scope of this certificate token. For example: the certificate token is granted for materials "rice" or "bread", then the scope string will be `MaterialName == "rice" || MaterialName == "bread"`.

The Certificate is owned by a supply chain participant while a Certificate Authority is owned by a certificate authority. 

A certificate authority can revoke a certificate to a participant by removing the connection between the Certificate Authority and the Certificate. 

##### Certificate Authority creation
A Certificate Authority can be created by calling CreateCertificateAuthority(Time uint64, NodeId string, OwnerPublicKey string, Signature string). 

##### Certificate Issuance
A Certfiicate can be created by calling IssueCertificate(Time uint64, NodeId string, SecretNodeId string, OwnerPublicKey string, Signature string, ValidFrom uint64, ValidTo uint64, Scope string, CANodeId string, CASecretNodeId string, CASignature string). If the 

##### Certificate Revocation
A Certfiicate can be revoked by calling RevokeCertificate(Time uint64, NodeId string, Signature string, CertificateId string).

#### Info
##### Data structure
A Info is a json object extending from the Node structure, with the following additional fields: Name string, Value string. This object is used to describe any information related to the node that it is attached to. It can also be used as a client-specific data. To ensure entegrity, data of an Info cannot be modified once created. Clients can still modify information by appending a new Info node to it, thereby forming a chain of the modification history of the data. All the modifications are publicly linked together to facilitate the asset transfer process, and because there shouldn't be any need to hide this information anyway. Clients can make use of the UpdateTime field to check the last modification happened before the asset transfer. The info is the child and the described node is the parent.

##### Info creation
An info node can be created by calling CreateInfo(Time uin64, NodeId string, NodeSecretId string, Name string, Value string, OwnerPublicKey string, Signature string, DescribedNodeId string, DescribedNodeSecretId string, DescribedNodeSignature string).

##### Info modification
One can modify the information by calling ModifyInfo(Time uin64, NewNodeId string, NewValue string, NewNodeSignature string, NodeId string, NodeSecretId string, NodeSignature string). The current Info node will then be finalized and will reference a new Info node with the NewValue value. 

#### Process
##### Data structure
A Process is a json object extending from the Node structure, with the following additional fields: Name string, Data string. It is used to denotes a process happening to an asset. 

##### Process creation
A Process can be created by calling CreateProcess(Time uint64, NodeId string, SecretNodeId string, Name string, Data string, Signature string, ProcessedNodeId string, ProcessedNodeSecretId string, ProcessedNodeSignature string).  The process is the child while the ProcessedNode is the parent.

#### Measurement
##### Data structure
A Measurement is a json object extending from the Node structure, with the following additional fields: Name string, Unit string, Value string. It is used to describe a measurement made by a sensor and can also be used to describe a process.

The Name field describes the name of the measurement.

The Unit field describes the unit used by the measurement, which must be in lowercase and contain only letters and "_" character.

The Value field describes the value of the measurement.

##### Measurement creation
A Measurement can be created by callling CreateMeasurement(Time uint64, NodeId string, Name string, Unit string, Value string, OwnerPublicKey string, Signature string).

##### Measurement attachment
After creation, a Measurement can be attached to another node to describe it by calling AttachMeasurement(Time uint64, MeasurementNodeId string, MeasurementSecretNodeId string, MeasurementSignature string, AttachedNodeId string, AttachedSecretNodeId, AttachedNodeSignature string). Here, the measurement is the child and the attached node is the parent. After this operation, the measurement is finalized and can no longer be modified.

### Asset-transfer protocol
#### Description
Thoughout their lifecycle, assets need to be transferred between participants. Thus, there must be a protocol for participants to initiate an asset transfer request and accept. There are multiple protocol choices available for this task such as REST, GRPC or GraphQL. Regardless of the protocol choice, the interaction flow will be the same: 1 party initiate an asset transfer / receive request, the other party then display this request to the user, the user verifies that the asset meets all of their requirements and accept / reject this request and the participant call the TransferAsset smart contract if the user accepts and sends a notification to the initial participant about the acceptance / rejection result.

#### Asset transfer / receive request
For asset transfer / receive, the initiator needs to transfer not only the asset, but also any related private connections that the recipient / sender will be interested in. The user can then verify the origin, certificate, measurement as well as any information related to the asset by fetching all the nodes connected by the revealed edges. How the user makes use of the information for verification is specific to each client.

// TODO: Add schema

### Client protocol
// TODO: Add scheme and description for 

### Connecting the dots
As discussed in the challenges section, the supply chain traceability is faced with 4 issues: labeling, third-party certification (TPC) fraud, transparency issues, lack of requirement for data sharing and interoperability. Let's see how we handle these challenges:
- Labeling: the verification process is handled automatically by the client application, which dramatically reduces the knowledge requirement on the user side. They just need to download a trusted application and the application should come bundled with the correct label requirement.
- TPC fraud: it is impossible for any intermediary participant to sell an unqualified product as one because the quantity of the assets is guaranteed to conserve throughtout their entire lifecycle. Therefore, the merchants cannot mix in unqualified products with qualified ones to gain benefit. If any product cannot be traced back to its production node, the client application can immediately reject it. Only the producer is capable of generating a fraudulent production. This must be prevented with the certificate authority regularly checking that the producer does indeed meet the requirement for the certificate and revoke otherwise. In addition, should it be required, an application can check that the materials used to produce a product must constitute a minimum amount. Finally, it is also possible for the producer to announce the product's intended destination to avoid any fraudulent swap (selling an unqualified product as qualified and the qualified product is sold without any tracing, although I don't believe there is any economic incentives for this).
- Transparency issues: thanks to distributed and immutable nature of the DLT, it is very difficult or even impossible for any participant to fraudulently modify any product trace, and any information can be undeniably proven to be created by the person owning the private key. 
- Lack of requirement for data sharing: the clients enforce the minimum data to be shared, otherwise it will reject the product as unqualified. Thus the prior participants must at least share these information, if they want their product to pass the verification. 
- Interoperability: assets, certificates, process and measurements are represented by the same model, thus eliminating any issues about interoperability. Furthermore, the asset-transfer and client protocol will share the same data schema, enabling different implementations to operate together.
- Confidentiality: participants can selectively share data that does not affect their competitive advantage.


The smart contract also support different units, allowing for different types of TRUs.

In addition to products, activites can also be traced, and measurements from sensors can be attached to a product / process to certify the process meets the required standard.


[1] M. van Hilten, G. Ongena and P. Ravesteijn (2020) "Blockchain for Organic Food Traceability: Case Studies on Drivers and Challenges" Front. Blockchain [Online] 3:567175. Available https://www.frontiersin.org/articles/10.3389/fbloc.2020.567175/full

[2]  M. M. Aung, and  Y. S. Chang (2014) "Traceability in a food supply chain: safety and quality perspectives" Food Control [Online] vol. 39, pp. 172–184. doi: 10.1016/j.foodcont.2013.11.007

[3]  L. Ge, C. Brewster, J. Spek, A. Smeenk, and J. Top, (2017) "Blockchain for Agriculture and Food, Findings From the Pilot Study". Wageningen: Wageningen University & Research. Available https://library.wur.nl/WebQuery/wurpubs/fulltext/426747

[4] T. Moe (1998) "Perspectives on traceability in food manufacture". Trends Food Sci. Technol. [Online] vol. 9, issue 5, pp. 211–214. doi: 10.1016/S0924-2244(98)00037-5

[6] Crypto "A Deep Dive Into Blockchain Scalability" (2020 Jan. 03) [Online]. Available: https://crypto.com/university/blockchain-scalability#:~:text=While%20Visa%20can%20process%20up,capability%20to%20achieve%20mass%20adoption.

[7] J. Polge, J. Robert and Y.L Traon (2021 Jun.) "Permissioned blockchain frameworks in the industry: A comparison" ICT Express [Online] vol. 7, issue 2, pp. 229-233. doi: 10.1016/S0924-2244(98)00037-5