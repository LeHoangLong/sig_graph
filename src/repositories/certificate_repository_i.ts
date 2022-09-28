import { Certificate } from "../models/certificate";
import { PublicKeyType } from "../models/user";

export interface CertificateRepositoryI {
    FetchCertificatesByOwner(iOwnerKey: PublicKeyType): Promise<Certificate[]>
}
