interface IGetAvatar {
  default(name: string): string;
}

const getAvatar: IGetAvatar = {
  default: (name: string): string => {
    const [firstName, lastName] = name.split(" ");
    return `https://eu.ui-avatars.com/api/?name=${firstName}+${lastName}&background=EB5757&color=fff&bold=true&rounded=true`;
  },
};

export default getAvatar;
