import { people } from "@googleapis/people";

export const getGooglePeopleEmail = async(accessToken: string): Promise<string | null> => {
  const api = people({ version: "v1", auth: accessToken });

  try {
    const res = await api.people.get({ resourceName: "people/me", personFields: "emailAddresses" });
    const email = res.data.emailAddresses?.find(addr => addr.metadata?.primary)?.value;

    return email ?? null;
  } catch (error) {
    return null;
  }
};