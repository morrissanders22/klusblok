type SendArgs = {
  to: string;
  subject: string;
  body: string;
};

export async function sendNotification(args: SendArgs): Promise<void> {
  console.log("[notification]", args.to, "—", args.subject);
  console.log(args.body);
}
