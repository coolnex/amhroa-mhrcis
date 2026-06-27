import { supabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";

export async function isResearchAdmin(){

const profile=await getCurrentProfile();

return profile?.role?.includes("Admin");

}

export async function canCreateProject(){

const profile=await getCurrentProfile();

return profile?.status==="Approved";

}

export async function canApproveProject(){

const profile=await getCurrentProfile();

return profile?.role?.includes("Admin");

}

export async function canEditProject(ownerId:string){

const profile=await getCurrentProfile();

if(!profile) return false;

if(profile.role.includes("Admin"))

return true;

return profile.id===ownerId;

}

export async function canDeleteProject(ownerId:string){

return canEditProject(ownerId);

}