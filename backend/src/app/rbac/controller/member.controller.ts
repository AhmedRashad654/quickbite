import { Response, Request } from 'express';
import { validateBody } from '../../../lib/validation/validate.js';
import { CreateMemberDTO, UpdateMemberBranchesDTO, UpdateMemberDTO } from '../dto/member.dto.js';
import { memberService, MemberService } from '../service/member.service.js';

export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  createMember = async (req: Request, res: Response) => {
    const data = await validateBody(CreateMemberDTO, req.body);
    const result = await this.memberService.createMember(Number(req.params.restaurantId), data);
    res.status(201).send(result);
  };

  listMembers = async (req: Request, res: Response) => {
    const result = await this.memberService.listMembers(Number(req.params.restaurantId));
    res.status(200).json(result);
  };

  updateMember = async (req: Request, res: Response) => {
    const data = await validateBody(UpdateMemberDTO, req.body);
    const result = await this.memberService.updateMember(
      Number(req.params.restaurantId),
      Number(req.params.memberId),
      data,
    );
    res.status(200).json(result);
  };

  deleteMember = async (req: Request, res: Response) => {
    const result = await this.memberService.deleteMember(
      Number(req.params.restaurantId),
      Number(req.params.memberId),
    );
    res.status(200).json(result);
  };

  updateMemberBranches = async (req: Request, res: Response) => {
    const data = await validateBody(UpdateMemberBranchesDTO, req.body);
    const result = await this.memberService.updateMemberBranches(
      Number(req.params.restaurantId),
      Number(req.params.memberId),
      data,
    );
    res.status(200).json(result);
  };

  getRolePermissions = async (req: Request, res: Response) => {
    const result = await this.memberService.getRolePermissions(req.params.role as string);
    res.status(200).json(result);
  };
}

export const memberController = new MemberController(memberService);
