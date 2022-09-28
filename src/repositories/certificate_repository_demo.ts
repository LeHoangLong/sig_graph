import { Certificate } from "../models/certificate";
import { PublicKeyType } from "../models/user";
import { CertificateRepositoryI } from "./certificate_repository_i";

export class CertificateRepositoryDemo implements CertificateRepositoryI {
    async FetchCertificatesByOwner(iOwnerKey: PublicKeyType): Promise<Certificate[]> {
        return []
    }
}